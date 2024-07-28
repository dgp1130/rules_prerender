import { ImperativeIterator, ImperativeIteratorFactory } from './imperative_iterator.mjs';
import { arrayFromAsync } from './iterables.mjs';

describe('imperative_iterator', () => {
    describe('ImperativeIterator', () => {
        it('iterates over a collection', async () => {
            const factory = ImperativeIterator.factory() as
                ImperativeIteratorFactory<number>;

            (async () => {
                const imperativeIterator = await factory.started;
                await imperativeIterator.emit(1);
                await imperativeIterator.emit(2);
                await imperativeIterator.emit(3);
                imperativeIterator.done();
            })();

            const emitted = await arrayFromAsync(factory.iterable);
            expect(emitted).toEqual([ 1, 2, 3 ]);
        });

        it('iterates over an errored collection', async () => {
            const factory = ImperativeIterator.factory() as
                ImperativeIteratorFactory<number>;
            const err = new Error('Oh noes!');

            (async () => {
                const imperativeIterator = await factory.started;
                await imperativeIterator.emit(1);
                imperativeIterator.error(err);
            })();

            await expectAsync(arrayFromAsync(factory.iterable))
                .toBeRejectedWith(err);
        });

        it('does not emit after an error', async () => {
            const factory = ImperativeIterator.factory() as
                ImperativeIteratorFactory<number>;

            (async () => {
                const imperativeIterator = await factory.started;
                imperativeIterator.error(new Error('Oh noes!'));
                await imperativeIterator.emit(1);
            })();

            await expectAsync(arrayFromAsync(factory.iterable)).toBeRejected();
        });

        it('iterates over an empty collection', async () => {
            const factory = ImperativeIterator.factory() as
                ImperativeIteratorFactory<number>;

            (async () => {
                const imperativeIterator = await factory.started;
                imperativeIterator.done();
            })();

            await expectAsync(arrayFromAsync(factory.iterable))
                .toBeResolvedTo([]);
        });

        it('pushes results to a pending promise', async () => {
            const factory = ImperativeIterator.factory() as
                ImperativeIteratorFactory<number>;

            (async () => {
                const imperativeIterator = await factory.started;
                await imperativeIterator.emit(1);
            })();

            const iterator = factory.iterable[Symbol.asyncIterator]();

            await expectAsync(iterator.next())
                .toBeResolvedTo({ value: 1, done: false });
        });

        it('pushes errors to a pending promise', async () => {
            const factory = ImperativeIterator.factory() as
                ImperativeIteratorFactory<number>;
            const err = new Error('Oh noes!');

            (async () => {
                const imperativeIterator = await factory.started;
                imperativeIterator.error(err);
            })();

            const iterator = factory.iterable[Symbol.asyncIterator]();
            await expectAsync(iterator.next()).toBeRejectedWith(err);
        });

        it('pushes done signal to a pending promise', async () => {
            const factory = ImperativeIterator.factory() as
                ImperativeIteratorFactory<number>;

            (async () => {
                const imperativeIterator = await factory.started;
                imperativeIterator.done();
            })();

            const iterator = factory.iterable[Symbol.asyncIterator]();
            await expectAsync(iterator.next())
                .toBeResolvedTo({ value: undefined, done: true });
        });

        it('queues results between polls', async () => {
            const factory = ImperativeIterator.factory() as
                ImperativeIteratorFactory<number>;

            (async () => {
                const imperativeIterator = await factory.started;

                // Synchronously emit two events.
                void imperativeIterator.emit(1);
                void imperativeIterator.emit(2);
            })();

            const iterator = factory.iterable[Symbol.asyncIterator]();

            await expectAsync(iterator.next())
                .toBeResolvedTo({ value: 1, done: false });
            await expectAsync(iterator.next())
                .toBeResolvedTo({ value: 2, done: false });
        });

        it('pushes `done` signal after completion', async () => {
            const factory = ImperativeIterator.factory() as
                ImperativeIteratorFactory<number>;

            (async () => {
                const imperativeIterator = await factory.started;

                imperativeIterator.done();
            })();

            const iterator = factory.iterable[Symbol.asyncIterator]();

            // Poll twice, should get `done` each time.
            await expectAsync(iterator.next())
                .toBeResolvedTo({ value: undefined, done: true });
            await expectAsync(iterator.next())
                .toBeResolvedTo({ value: undefined, done: true });
        });

        it('lazily instantiates an `ImperativeIterator` when it is polled', async () => {
            const iteratorFactory = ImperativeIterator.factory() as
                ImperativeIteratorFactory<number>;

            await expectAsync(iteratorFactory.started).toBePending();
            const iterator = iteratorFactory.iterable[Symbol.asyncIterator]();
            void iterator.next();
            await expectAsync(iteratorFactory.started).toBeResolved();
        });

        it('does not leak memory after `done` is called', async () => {
            const factory = ImperativeIterator.factory() as
                ImperativeIteratorFactory<number>;

            // Poll the iterator to start it.
            const iterator = factory.iterable[Symbol.asyncIterator]();
            void iterator.next();

            // Emit some events.
            const imperativeIterator = await factory.started;
            void imperativeIterator.emit(1); // Responds to `next` call.
            void imperativeIterator.emit(2); // Adds to queue.
            imperativeIterator.done();  // Adds to queue.
            void imperativeIterator.emit(3); // Should *not* add after `done`.

            // Peek into private memory to make sure it does not leak.
            const queue = (imperativeIterator as any as {
                queue: Array<IteratorResult<number>>,
            }).queue;

            expect(queue).toEqual([
                { value: 2, done: false },
                { value: undefined, done: true },
                // No `{ value: 3, done: false }`
            ]);
        });

        it('does not leak memory after `error` is called', async () => {
            const factory = ImperativeIterator.factory() as
                ImperativeIteratorFactory<number>;
            const err = new Error('Oh noes!');

            // Poll the iterator to start it.
            const iterator = factory.iterable[Symbol.asyncIterator]();
            void iterator.next();

            // Emit some events.
            const imperativeIterator = await factory.started;
            void imperativeIterator.emit(1); // Responds to `next` call.
            void imperativeIterator.emit(2); // Adds to queue.
            imperativeIterator.error(err); // Adds to queue.
            void imperativeIterator.emit(3); // Should *not* add after `error`.

            // Peek into private memory to make sure it does not leak.
            const queue = (iterator as any as {
                queue: any[],
            }).queue;

            expect(queue).toEqual([
                { value: 2, done: false },
                { value: err, error: true },
                // No `{ value: 3, done: false }`
            ]);
        });
    });
});
