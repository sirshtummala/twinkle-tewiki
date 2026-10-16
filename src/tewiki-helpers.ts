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
