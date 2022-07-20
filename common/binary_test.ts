import { main as mainReal } from './binary';

// Wrap `main`'s type to return its `Promise` to easily `await` it.
function main(...args: Parameters<typeof mainReal>): Promise<void> {
    return mainReal(...args) as unknown as Promise<void>;
}

const originalArgs = process.argv;
describe('binary', () => {
    beforeEach(() => {
        process.argv = originalArgs;
    });

    describe('main()', () => {
        it('exits with the return value of the callback', async () => {
            process.argv = [ 'node', 'foo.js', '--bar', 'baz' ];
            spyOn(process, 'exit');

            const callback = jasmine.createSpy('callback').and.resolveTo(0);
            await main(callback);

            expect(callback).toHaveBeenCalledOnceWith([ '--bar', 'baz' ]);

            expect(process.exit).toHaveBeenCalledOnceWith(0);
        });

        it('prints error message and exits with code 0 when an error is thrown', async () => {
            spyOn(process, 'exit');
            const consoleErrorSpy = spyOn(console, 'error');

            const callback = jasmine.createSpy('callback')
                .and.rejectWith(new Error('RAM exploded.'));
            await main(callback);

            expect(console.error).toHaveBeenCalledTimes(1);
            const errorLog = consoleErrorSpy.calls.first().args[0];
            expect(errorLog).toContain('RAM exploded.');
        });

        it('prints thrown object when a non-Error object is thrown', async () => {
            spyOn(process, 'exit');
            const consoleErrorSpy = spyOn(console, 'error');

            const callback = jasmine.createSpy('callback')
                .and.rejectWith('RAM exploded.');
            await main(callback);

            expect(console.error).toHaveBeenCalledTimes(1);
            const errorLog = consoleErrorSpy.calls.first().args[0];
            expect(errorLog).toBe('RAM exploded.');
        });
    });
});
