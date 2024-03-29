import { arrayFromAsync, parallel } from './iterables.mjs';

describe('iterables', () => {
    describe('parallel', () => {
        it('merges the given iterables', async () => {
            const merged = parallel(
                (async function* (): AsyncGenerator<number, void, void> {
                    yield 1;
                })(),
                (async function* (): AsyncGenerator<number, void, void> {
                    yield 2;
                })(),
                (async function* (): AsyncGenerator<number, void, void> {
                    yield 3;
                })(),
            );

            await expectAsync(arrayFromAsync(merged))
                .toBeResolvedTo([ 1, 2, 3 ]);
        });

        it('runs the given iterables in parallel', async () => {
            const merged = parallel(
                (async function* (): AsyncGenerator<number, void, void> {
                    yield 1;
                    yield 4;
                })(),
                (async function* (): AsyncGenerator<number, void, void> {
                    yield 2;
                    yield 5;
                })(),
                (async function* (): AsyncGenerator<number, void, void> {
                    yield 3;
                    yield 6;
                })(),
            );

            await expectAsync(arrayFromAsync(merged))
                .toBeResolvedTo([ 1, 2, 3, 4, 5, 6 ]);
        });

        it('yields the results in order', async () => {
            const merged = parallel(
                (async function* (): AsyncGenerator<number, void, void> {
                    yield 1;
                    await timeout(1);
                    yield 5;
                })(),
                (async function* (): AsyncGenerator<number, void, void> {
                    yield 2;
                    yield 4;
                })(),
                (async function* (): AsyncGenerator<number, void, void> {
                    yield 3;
                    await timeout(2);
                    yield 6;
                })(),
            );

            await expectAsync(arrayFromAsync(merged))
                .toBeResolvedTo([ 1, 2, 3, 4, 5, 6 ]);
        });

        it('throws an error when any iterable throws', async () => {
            const err = new Error('Oh noes!');
            const merged = parallel(
                (async function* (): AsyncGenerator<number, void, void> {
                    yield 1;
                })(),
                // eslint-disable-next-line require-yield
                (async function* (): AsyncGenerator<number, void, void> {
                    throw err;
                })(),
                (async function* (): AsyncGenerator<number, void, void> {
                    yield 3;
                })(),
            );

            await expectAsync(arrayFromAsync(merged)).toBeRejectedWith(err);
        });

        it('merges empty iterables', async () => {
            const merged = parallel(
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                (async function* (): AsyncGenerator<number, void, void> { })(),
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                (async function* (): AsyncGenerator<number, void, void> { })(),
            );

            await expectAsync(arrayFromAsync(merged)).toBeResolvedTo([]);
        });

        it('starts lazily', async () => {
            let started = false;
            const merged = parallel(
                // eslint-disable-next-line require-yield
                (async function* (): AsyncGenerator<number, void, void> {
                    started = true;
                })(),
            );

            expect(started).toBe(false);

            // Starts on `next` call.
            const iterable = merged[Symbol.asyncIterator]();
            await iterable.next();

            expect(started).toBe(true);
        });

        it('merges no iterables', async () => {
            await expectAsync(arrayFromAsync(parallel())).toBeResolvedTo([]);
        });
    });

    describe('arrayFromAsync', () => {
        it('collects all the values emitted by the iterable', async () => {
            async function* generate(): AsyncGenerator<number, void, void> {
                yield 1;
                yield 2;
                await timeout(1);
                yield 3;
            }

            const results = await arrayFromAsync(generate());

            expect(results).toEqual([ 1, 2, 3 ]);
        });

        it('throws when the input iterable throws', async () => {
            const err = new Error('Oh noes!');
            // eslint-disable-next-line require-yield
            async function* generate(): AsyncGenerator<number, void, void> {
                throw err;
            }

            await expectAsync(arrayFromAsync(generate())).toBeRejectedWith(err);
        });
    });
});

function timeout(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(() => { resolve(); }, ms);
    });
}
