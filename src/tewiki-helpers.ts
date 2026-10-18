/**
 * Pure helpers for Tewiki-specific AfD page names and latest-additions edits.
 * These functions do not perform network requests or save wiki pages.
 */

import { tewikiDeletionWorkflow } from './tewiki-config';

export type LatestAdditionsResult =
	| { ok: true; text: string; alreadyPresent: boolean }
	| { ok: false; reason: 'anchor-missing' | 'anchor-ambiguous' | 'section-boundary-missing' };

/**
 * Build the individual Tewiki AfD discussion page title from an article title.
 * The title passed in should be the article's page title, without namespace.
 */
export function getAfDDiscussionTitle(articleTitle: string): string {
	return `${tewikiDeletionWorkflow.afdDiscussionRoot}/${articleTitle}`;
}

/**
 * Build a creator notice that links directly to the actual tewiki discussion.
 * Avoid the English Wikipedia-specific `afd notice` template, whose link target
 * and numbering conventions have not been confirmed for tewiki.
 */
export function getAfDNotificationText(
	articleTitle: string,
	discussionTitle: string,
	tagOutcome: 'tagged' | 'edit-request' | undefined = 'tagged'
): string {
	if (tagOutcome === 'edit-request') {
		return `\n[[:${articleTitle}]] వ్యాసాన్ని తొలగింపు చర్చకు ప్రతిపాదించారు. అయితే వ్యాసానికి నేరుగా తొలగింపు మూసను చేర్చలేకపోవడంతో, దాని చర్చాపేజీలో సవరణ అభ్యర్థనను ఉంచాం. దయచేసి [[${discussionTitle}]] చర్చలో పాల్గొనండి. ~~~~`;
	}
	return `\nమీరు సృష్టించిన [[:${articleTitle}]] వ్యాసాన్ని తొలగింపు చర్చకు ప్రతిపాదించారు. దయచేసి [[${discussionTitle}]] చర్చలో పాల్గొనండి. ~~~~`;
}

/** A talk-page edit request is not proof that the article itself was tagged. */
export function shouldMarkAfDArticleAsPatrolled(tagOutcome: 'tagged' | 'edit-request' | undefined): boolean {
	return tagOutcome === 'tagged';
}

/**
 * Add a nomination link to the uniquely identified latest-additions section.
 *
 * Safety rules:
 * - Refuse to edit if the anchor is missing or appears more than once.
 * - Refuse if the section's end cannot be identified.
 * - Do not add a duplicate link.
 * - Preserve the section's existing list marker (# or *).
 * - Place the link after the final list item, or immediately after the anchor
 *   line when no list items exist.
 * - Preserve the rest of the page text.
 *
 * This is a pure transformation. The caller is responsible for previewing,
 * obtaining user confirmation as appropriate, and saving via the MediaWiki API.
 */
export function addAfDLatestAddition(
	pageText: string,
	discussionTitle: string
): LatestAdditionsResult {
	const anchor = tewikiDeletionWorkflow.afdLatestAdditionsAnchor;
	const anchorPattern = new RegExp(
		`(?:\\{\\{\\s*anchor\\s*\\|\\s*${escapeRegExp(anchor)}\\s*(?:\\|[^}]+)?\\}\\}|id\\s*=\\s*["']?${escapeRegExp(anchor)}["']?)`,
		'gi'
	);
	const anchors: Array<{ index: number }> = [];
	let anchorMatch: RegExpExecArray | null;
	while ((anchorMatch = anchorPattern.exec(pageText)) !== null) {
		anchors.push({ index: anchorMatch.index });
	}

	// Prefer the explicit latest-additions anchor used by the live page.
	// If it is absent, fall back to the exact local heading text, ignoring inline
	// HTML such as the anchor span; refuse to proceed if the target is missing
	// or ambiguous.
	if (anchors.length === 0) {
		// Match the heading's visible text, ignoring inline HTML such as the
		// <span class="anchor"> element used on the live Telugu AfD page.
		const headingPattern = /^={1,6}([^\n]*?)={1,6}\s*$/gm;
		let headingMatch: RegExpExecArray | null;
		while ((headingMatch = headingPattern.exec(pageText)) !== null) {
			const headingText = headingMatch[1].replace(/<[^>]*>/g, '').trim();
			if (headingText === 'తాజా చేర్పులు') {
				anchors.push({ index: headingMatch.index });
			}
		}
	}

	if (anchors.length === 0) {
		return { ok: false, reason: 'anchor-missing' };
	}
	if (anchors.length !== 1) {
		return { ok: false, reason: 'anchor-ambiguous' };
	}

	const anchorIndex = anchors[0].index!;
	const lineEndIndex = pageText.indexOf('\n', anchorIndex);
	const anchorLineEnd = lineEndIndex === -1 ? pageText.length : lineEndIndex + 1;

	// A new section heading marks the end of the additions section. If there is
	// no following heading, the section continues to end of page.
	const followingHeading = /^={1,6}[^\n]*={1,6}\s*$/gm;
	followingHeading.lastIndex = anchorLineEnd;
	const headingMatch = followingHeading.exec(pageText);
	const sectionEnd = headingMatch ? headingMatch.index : pageText.length;

	if (sectionEnd < anchorLineEnd) {
		return { ok: false, reason: 'section-boundary-missing' };
	}

	const sectionText = pageText.slice(anchorLineEnd, sectionEnd);
	const link = `[[${discussionTitle}]]`;
	if (sectionText.includes(link)) {
		return { ok: true, text: pageText, alreadyPresent: true };
	}

	const bulletPattern = /^([*#]+)[^\n]*$/gm;
	let lastBullet: RegExpExecArray | null = null;
	let match: RegExpExecArray | null;
	while ((match = bulletPattern.exec(sectionText)) !== null) {
		lastBullet = match;
	}
	const bullet = `${lastBullet?.[1] ?? '#'} ${link}`;

	let updatedSection: string;
	if (lastBullet) {
		const insertAt = lastBullet.index + lastBullet[0].length;
		updatedSection =
			sectionText.slice(0, insertAt) +
			'\n' +
			bullet +
			sectionText.slice(insertAt);
	} else {
		updatedSection = `${bullet}\n${sectionText.replace(/^\n+/, '')}`;
	}

	return {
		ok: true,
		text:
			pageText.slice(0, anchorLineEnd) +
			updatedSection +
			pageText.slice(sectionEnd),
		alreadyPresent: false,
	};
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


/**
 * Build a failure callback for Morebits.taskManager tasks.
 *
 * twinkle-core 3.1.2 calls a task's failure callback when a dependency rejects,
 * but does not reject the dependent task's own Deferred in that path. Rejecting
 * that Deferred here lets the failure propagate through the dependency chain
 * and allows execute() to settle instead of waiting indefinitely.
 */
export interface TaskManagerFailureTarget {
	deferreds: Map<Function, {
		state: () => string;
		reject: (...args: any[]) => unknown;
	}>;
}

/**
 * Treat failures in a non-essential task as best-effort and let the workflow continue.
 * Accepts a jQuery promise because Morebits tasks use jQuery Deferreds.
 */
export function ignoreOptionalTaskFailure<T>(promise: JQuery.Promise<T>): JQuery.Promise<T | void> {
	return promise.catch(() => undefined);
}

export function makeTaskFailureHandler(
	taskManager: TaskManagerFailureTarget,
	task: Function,
	onFailure?: (...args: any[]) => void
): (...args: any[]) => void {
	return function (this: unknown, ...args: any[]) {
		const deferred = taskManager.deferreds.get(task);
		if (deferred && deferred.state() === 'pending') {
			deferred.reject(...args);
		}
		if (onFailure) {
			onFailure.apply(this, args);
		}
	};
}
