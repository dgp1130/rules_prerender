import { TestId, testId, enableTestIds, internalTestonly__disableTestIds } from './test_id.mjs';

describe('test_id', () => {
    beforeEach(() => {
        internalTestonly__disableTestIds();
    });

    it('returns a test ID when enabled', () => {
        enableTestIds();

        expect(testId('foo') as string).toBe('foo');
    });

    it('returns `undefined` when not enabled', () => {
        // enableTestId(); // Never enabled.

        expect(testId('foo')).toBe(undefined);
    });

    describe('TestId', () => {
        it('is not assignable from a string', () => {
            // @ts-expect-error String assignments should fail, must go through
            // `testId` factory.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const id: TestId = 'test';

            expect().nothing(); // Type only test, only needs to compile.
        });
    });
});
