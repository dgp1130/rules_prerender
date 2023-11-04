import { Delayed } from './delayed.mjs';

describe('delayed', () => {
    describe('Delayed', () => {
        describe('resolve', () => {
            it('resolves the promise', async () => {
                const delayed = new Delayed();

                delayed.resolve('test');

                await expectAsync(delayed.promise).toBeResolvedTo('test');
            });
        });

        describe('reject', () => {
            it('rejects the promise', async () => {
                const delayed = new Delayed();

                delayed.reject(new Error('Oh noes!'));

                await expectAsync(delayed.promise)
                    .toBeRejectedWith(new Error('Oh noes!'));
            });
        });

        it('does not overwrite a previously emitted value', async () => {
            const delayed = new Delayed();

            // Resolve *and* reject, only the first result should be emitted.
            delayed.resolve('test');
            delayed.reject(new Error('Oh noes!'));

            await expectAsync(delayed.promise).toBeResolvedTo('test');
        });
    });
});
