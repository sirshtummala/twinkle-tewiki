import { addAfDLatestAddition, getAfDDiscussionTitle, makeTaskFailureHandler } from '../../src/tewiki-helpers';

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

	test('uses the live Telugu latest-additions heading when no explicit anchor exists', () => {
		const input = [
			'== తాజా చేర్పులు ==',
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

	test('settles a dependent task when its prerequisite rejects in the task-manager sequence', async () => {
		// Mirrors Morebits.taskManager's dependency-failure path: the core manager
		// invokes the dependent task's failure callback but does not reject its
		// Deferred unless that callback does so.
		const makeDeferred = () => {
			let state: 'pending' | 'resolved' | 'rejected' = 'pending';
			let resolvePromise!: () => void;
			let rejectPromise!: (reason: unknown) => void;
			const promise = new Promise<void>((resolve, reject) => {
				resolvePromise = resolve;
				rejectPromise = reject;
			});
			return {
				promise,
				state: () => state,
				resolve: () => {
					if (state === 'pending') {
						state = 'resolved';
						resolvePromise();
					}
				},
				reject: (reason: unknown) => {
					if (state === 'pending') {
						state = 'rejected';
						rejectPromise(reason);
					}
				},
			};
		};

		const prerequisite = () => undefined;
		const dependent = jest.fn(() => Promise.resolve());
		const deferreds = new Map([
			[prerequisite, makeDeferred()],
			[dependent, makeDeferred()],
		]);
		const failureHandler = makeTaskFailureHandler({ deferreds }, dependent);
		const prerequisiteDeferred = deferreds.get(prerequisite)!;
		const dependentDeferred = deferreds.get(dependent)!;

		// Simulate the prerequisite rejection and the core manager's failure callback.
		prerequisiteDeferred.reject(new Error('preflight failed'));
		await prerequisiteDeferred.promise.catch(() => undefined);
		failureHandler(new Error('preflight failed'));

		expect(dependent).not.toHaveBeenCalled();
		expect(dependentDeferred.state()).toBe('rejected');
		await expect(dependentDeferred.promise).rejects.toThrow('preflight failed');
	});

});
