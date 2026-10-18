import {
	addAfDLatestAddition,
	getAfDDiscussionTitle,
	getAfDNotificationText,
	getAfDEditRequestText,
	ignoreOptionalTaskFailure,
	makeTaskFailureHandler,
	shouldMarkAfDArticleAsPatrolled,
} from '../../src/tewiki-helpers';

describe('Telugu Wikipedia AfD helpers', () => {
	test('builds the discussion page title under the Telugu AfD root', () => {
		expect(getAfDDiscussionTitle('Example article')).toBe(
			'వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Example article'
		);
	});

	test('protected-article request uses Telugu text and does not depend on an English template', () => {
		const request = getAfDEditRequestText(
			'Example article',
			'వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Example article',
			'{{subst:afd|help=off}}\n'
		);
		expect(request).toContain('వ్యాసం [[:Example article]]');
		expect(request).toContain('[[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Example article]]');
		expect(request).toContain('<nowiki>{{subst:afd|help=off}}</nowiki>');
		expect(request).not.toContain('Xfd edit protected');
	});

	test('creator notice explains when only an edit request was posted', () => {
		const notice = getAfDNotificationText(
			'Example article',
			'వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Example article',
			'edit-request'
		);
		expect(notice).toContain('సవరణ అభ్యర్థనను ఉంచాం');
		expect(notice).toContain('[[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Example article]]');
		expect(notice).not.toContain('మీరు సృష్టించిన');
	});

	test('creator notice links directly to a numbered Telugu discussion page', () => {
		expect(
			getAfDNotificationText(
				'Example article',
				'వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Example article (2nd nomination)'
			)
		).toBe(
			'\nమీరు సృష్టించిన [[:Example article]] వ్యాసాన్ని తొలగింపు చర్చకు ప్రతిపాదించారు. దయచేసి [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Example article (2nd nomination)]] చర్చలో పాల్గొనండి. ~~~~'
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

	test('uses the live Telugu latest-additions heading when no explicit anchor exists', () => {
		const input = [
			'== <span class="anchor"></span> తాజా చేర్పులు ==',
			'# [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Existing article]]',
			'',
			'== పాత చర్చలు ==',
		].join('\n');
		const result = addAfDLatestAddition(input, 'వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/New article');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.text).toContain('# [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/New article]]');
			expect(result.text).toContain('== పాత చర్చలు ==');
		}
	});

	test('fails safely when the latest-additions heading is ambiguous', () => {
		const input = '== తాజా చేర్పులు ==\n# one\n== తాజా చేర్పులు ==\n# two\n';
		expect(addAfDLatestAddition(input, 'Discussion')).toEqual({
			ok: false,
			reason: 'anchor-ambiguous',
		});
	});

	test('fails safely when both the explicit anchor and fallback heading are missing', () => {
		expect(addAfDLatestAddition('== ఇతర విభాగం ==\n* existing\n', 'Discussion')).toEqual({
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


describe('AfD patrol safety', () => {
	test('allows patrol after a direct article tag', () => {
		expect(shouldMarkAfDArticleAsPatrolled('tagged')).toBe(true);
	});

	test('does not patrol when only a talk-page edit request was posted', () => {
		expect(shouldMarkAfDArticleAsPatrolled('edit-request')).toBe(false);
	});

	test('does not patrol when the tag outcome is unknown', () => {
		expect(shouldMarkAfDArticleAsPatrolled(undefined)).toBe(false);
	});
});

describe('Optional AfD task failures', () => {
	test('converts an optional task rejection into a resolved promise', async () => {
		const optionalTask = $.Deferred();
		const result = ignoreOptionalTaskFailure(optionalTask.promise());

		optionalTask.reject(new Error('deletion-sorting page load failed'));

		await expect(new Promise((resolve, reject) => result.then(resolve, reject))).resolves.toBeUndefined();
	});
});

describe('AfD task failure propagation', () => {
	test('rejects a dependent task deferred when a prerequisite fails', () => {
		let state = 'pending';
		const task = () => undefined;
		const reject = jest.fn((..._args: unknown[]) => {
			state = 'rejected';
		});
		const taskManager = {
			deferreds: new Map([
				[
					task,
					{
						state: () => state,
						reject,
					},
				],
			]),
		};
		const onFailure = jest.fn();
		const handler = makeTaskFailureHandler(taskManager, task, onFailure);

		handler('prerequisite failed');

		expect(reject).toHaveBeenCalledWith('prerequisite failed');
		expect(state).toBe('rejected');
		expect(onFailure).toHaveBeenCalledWith('prerequisite failed');
	});

	test('does not try to reject a task deferred that has already settled', () => {
		const task = () => undefined;
		const reject = jest.fn();
		const taskManager = {
			deferreds: new Map([
				[
					task,
					{
						state: () => 'rejected',
						reject,
					},
				],
			]),
		};

		makeTaskFailureHandler(taskManager, task)('prerequisite failed');

		expect(reject).not.toHaveBeenCalled();
	});

	test('settles a dependent task when a prerequisite rejects in Morebits.taskManager', async () => {
		// Load the actual Morebits implementation shipped by the twinkle-core dependency.
		require('twinkle-core/morebits/morebits.js');
		const Morebits = (window as any).Morebits;
		const taskManager = new Morebits.taskManager();
		const prerequisite = jest.fn(() => $.Deferred().reject(new Error('preflight failed')));
		const dependent = jest.fn(() => $.Deferred().resolve());

		taskManager.add(prerequisite, []);
		let signalDependentFailure: (() => void) | undefined;
		const dependentFailure = new Promise<void>((resolve) => {
			signalDependentFailure = resolve;
		});
		taskManager.add(
			dependent,
			[prerequisite],
			makeTaskFailureHandler(taskManager, dependent, () => signalDependentFailure?.())
		);

		const execution = taskManager.execute();
		await expect(
			new Promise((resolve, reject) => execution.then(resolve, reject))
		).rejects.toThrow('preflight failed');
		// The manager's overall promise can reject before the dependency-failure
		// callback runs, so wait for that callback before inspecting its deferred.
		await dependentFailure;

		expect(prerequisite).toHaveBeenCalledTimes(1);
		expect(dependent).not.toHaveBeenCalled();
		expect(taskManager.deferreds.get(dependent).state()).toBe('rejected');
	});

});
