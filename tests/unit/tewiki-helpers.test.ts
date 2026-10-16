import { addAfDLatestAddition, getAfDDiscussionTitle } from '../../src/tewiki-helpers';

describe('Telugu Wikipedia AfD helpers', () => {
	test('builds the discussion page title under the Telugu AfD root', () => {
		expect(getAfDDiscussionTitle('Example article')).toBe(
			'వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Example article'
		);
	});

	test('adds a nomination after the final bullet in latest additions', () => {
		const input = [
			'== తాజా చేర్పులు ==',
			'{{anchor|latest-additions}}',
			'* [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Existing article]]',
			'* [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Another article]]',
			'',
			'== ఇతర విభాగం ==',
			'Keep this text unchanged.',
		].join('\n');
		const result = addAfDLatestAddition(
			input,
			'వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/New article'
		);

		expect(result).toEqual({
			ok: true,
			alreadyPresent: false,
			text: input.replace(
				'* [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Another article]]',
				'* [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Another article]]\n* [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/New article]]'
			),
		});
	});

	test('does not add a duplicate nomination link', () => {
		const link = '[[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Example article]]';
		const input = `== తాజా చేర్పులు ==\n{{anchor|latest-additions}}\n* ${link}\n\n== ఇతర విభాగం ==\n`;
		expect(addAfDLatestAddition(input, link.slice(2, -2))).toEqual({
			ok: true,
			text: input,
			alreadyPresent: true,
		});
	});

	test('fails safely when the anchor is missing', () => {
		expect(addAfDLatestAddition('== తాజా చేర్పులు ==\n* existing\n', 'Discussion')).toEqual({
			ok: false,
			reason: 'anchor-missing',
		});
	});

	test('fails safely when the anchor is ambiguous', () => {
		const input = '{{anchor|latest-additions}}\n* one\n{{anchor|latest-additions}}\n* two\n';
		expect(addAfDLatestAddition(input, 'Discussion')).toEqual({
			ok: false,
			reason: 'anchor-ambiguous',
		});
	});

	test('preserves numbered-list formatting on the Telugu AfD page', () => {
		const input = [
			'== <span class="anchor" id="latest-additions"></span> తాజా చేర్పులు ==',
			'Introductory text.',
			'# [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Existing article]]',
			'# [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Another article]]',
			'',
			'==పాత చర్చలు ==',
			'Keep this text unchanged.',
		].join('\n');
		const result = addAfDLatestAddition(
			input,
			'వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/New article'
		);

		expect(result).toEqual({
			ok: true,
			alreadyPresent: false,
			text: input.replace(
				'# [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Another article]]',
				'# [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Another article]]\n# [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/New article]]'
			),
		});
	});

	test('supports an HTML id anchor', () => {
		const input = '<span id="latest-additions"></span>\n\n== Other section ==\n';
		const result = addAfDLatestAddition(input, 'Discussion');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.text).toContain('# [[Discussion]]');
			expect(result.text).toContain('== Other section ==');
		}
	});
});
