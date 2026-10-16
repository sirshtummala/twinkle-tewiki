import {
	addAfDLatestAddition,
	getAfDDiscussionTitle,
} from '../../src/tewiki-helpers';
import { mapCategory, mapDestination, tewikiDeletionWorkflow } from '../../src/tewiki-config';

describe('Tewiki AfD helpers', () => {
	const discussion = 'వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/ఉదాహరణ';

	it('builds the local individual discussion title', () => {
		expect(getAfDDiscussionTitle('ఉదాహరణ')).toBe(discussion);
	});

	it('adds the link after the last bullet and before explanatory text', () => {
		const original = [
			'Intro text',
			'== తాజా చేర్పులు ==',
			'{{anchor|latest-additions}}',
			'* [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/మొదటి వ్యాసం]]',
			'* [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/రెండవ వ్యాసం]]',
			'ఈ జాబితా గురించి వివరణ.',
			'== ఇతర విభాగం ==',
			'Keep this text.',
		].join('\n');
		const result = addAfDLatestAddition(original, discussion);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.alreadyPresent).toBe(false);
			expect(result.text).toContain(
				'* [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/రెండవ వ్యాసం]]\n* [[' +
					discussion +
					']]\nఈ జాబితా గురించి వివరణ.'
			);
			expect(result.text).toContain('== ఇతర విభాగం ==\nKeep this text.');
		}
	});

	it('adds the first bullet at the start when the section has no bullets', () => {
		const original = [
			'== తాజా చేర్పులు ==',
			'{{anchor|latest-additions}}',
			'ఇక్కడ తాజా చేర్పులు కనిపిస్తాయి.',
			'== ఇతర విభాగం ==',
		].join('\n');
		const result = addAfDLatestAddition(original, discussion);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.text).toContain(
				'{{anchor|latest-additions}}\n# [[' +
					discussion +
					']]\nఇక్కడ తాజా చేర్పులు కనిపిస్తాయి.'
			);
		}
	});

	it('does not add a duplicate nomination link', () => {
		const original = [
			'== తాజా చేర్పులు ==',
			'{{anchor|latest-additions}}',
			'* [[' + discussion + ']]',
			'== ఇతర విభాగం ==',
		].join('\n');
		const result = addAfDLatestAddition(original, discussion);

		expect(result).toEqual({
			ok: true,
			text: original,
			alreadyPresent: true,
		});
	});

	it('refuses to edit if the anchor is missing', () => {
		expect(addAfDLatestAddition('No anchor here', discussion)).toEqual({
			ok: false,
			reason: 'anchor-missing',
		});
	});

	it('refuses to edit if the anchor is ambiguous', () => {
		const original =
			'{{anchor|latest-additions}}\n' +
			'* [[Existing discussion]]\n' +
			'{{anchor|latest-additions}}';
		expect(addAfDLatestAddition(original, discussion)).toEqual({
			ok: false,
			reason: 'anchor-ambiguous',
		});
	});
});


describe('Tewiki configuration mappings', () => {
	it('maps confirmed destinations and preserves unknown destinations', () => {
		expect(mapDestination('Wikipedia:Articles for deletion')).toBe('వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు');
		expect(mapDestination('Wikipedia:Requested moves/Technical requests')).toBe('Wikipedia:Requested moves/Technical requests');
	});

	it('maps confirmed categories and preserves unknown categories', () => {
		expect(mapCategory('Category:Living people')).toBe('వర్గం:జీవిస్తున్న ప్రజలు');
		expect(mapCategory('Category:Wikipedia books (user books)')).toBe('Category:Wikipedia books (user books)');
	});

	it('explicitly disables dated XfD venue logs', () => {
		expect(tewikiDeletionWorkflow.createDatedXfdVenueLogs).toBe(false);
		expect(tewikiDeletionWorkflow.translationTagRequiresEditorSelection).toBe(true);
	});
});
