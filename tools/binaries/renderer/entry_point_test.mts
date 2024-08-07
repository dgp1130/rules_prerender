import { PrerenderResource } from 'rules_prerender';
import { Probably } from '../../../common/probably.mjs';
import { invoke } from './entry_point.mjs';

function definitelyIterable<T>(probably: Iterable<Probably<T>> | AsyncIterable<Probably<T>>): Iterable<T> | AsyncIterable<T> {
    return probably as unknown as Iterable<T> | AsyncIterable<T>;
}

describe('entry_point', () => {
    describe('invoke()', () => {
        it('invokes the given entry point and returns its `Iterable<PrerenderResource>` value', async () => {
            const rendered = definitelyIterable(await invoke(() => [
                PrerenderResource.fromText('/foo.txt', 'Hello, foo!'),
                PrerenderResource.fromText('/bar.txt', 'Hello, bar!'),
                PrerenderResource.fromText('/baz.txt', 'Hello, baz!'),
            ], './foo.js'));

            expect((rendered as any)[Symbol.iterator]).toBeDefined();
            expect(Array.from(rendered as Iterable<PrerenderResource>)).toEqual([
                PrerenderResource.fromText('/foo.txt', 'Hello, foo!'),
                PrerenderResource.fromText('/bar.txt', 'Hello, bar!'),
                PrerenderResource.fromText('/baz.txt', 'Hello, baz!'),
            ]);
        });

        it('invokes the given entry point and awaits its `Promise<Iterable<PrerenderResource>>` value', async () => {
            const rendered = definitelyIterable(await invoke(() => [
                PrerenderResource.fromText('/foo.txt', 'Hello, foo!'),
                PrerenderResource.fromText('/bar.txt', 'Hello, bar!'),
                PrerenderResource.fromText('/baz.txt', 'Hello, baz!'),
            ], './foo.js'));

            expect((rendered as any)[Symbol.iterator]).toBeDefined();
            expect(Array.from(rendered as Iterable<PrerenderResource>)).toEqual([
                PrerenderResource.fromText('/foo.txt', 'Hello, foo!'),
                PrerenderResource.fromText('/bar.txt', 'Hello, bar!'),
                PrerenderResource.fromText('/baz.txt', 'Hello, baz!'),
            ]);
        });

        it('invokes the given entry point and returns its `AsyncIterable<PrerenderResource>` value', async () => {
            const rendered = definitelyIterable(await invoke(async function*() {
                yield PrerenderResource.fromText('/foo.txt', 'Hello, foo!');
                yield PrerenderResource.fromText('/bar.txt', 'Hello, bar!');
                yield PrerenderResource.fromText('/baz.txt', 'Hello, baz!');
            }, './foo.js'));

            expect((rendered as any)[Symbol.asyncIterator]).toBeDefined();
            const renderedArray = await asyncIterableToArray(
                rendered as AsyncIterable<PrerenderResource>);
            expect(renderedArray).toEqual([
                PrerenderResource.fromText('/foo.txt', 'Hello, foo!'),
                PrerenderResource.fromText('/bar.txt', 'Hello, bar!'),
                PrerenderResource.fromText('/baz.txt', 'Hello, baz!'),
            ]);
        });

        it('invokes the given entry point when it is an object with a `default` property', async () => {
            const rendered = definitelyIterable(await invoke({
                default: () => [
                    PrerenderResource.fromText('/foo.txt', 'Hello, foo!'),
                ],
            }, './foo.js'));

            expect((rendered as any)[Symbol.iterator]).toBeDefined();
            expect(Array.from(rendered as Iterable<PrerenderResource>)).toEqual([
                PrerenderResource.fromText('/foo.txt', 'Hello, foo!'),
            ]);
        });

        it('throws an error if the imported module is not an object', async () => {
            await expectAsync(invoke('not an object', './foo.js')).toBeRejectedWithError(
                /did not export a CommonJS module/);
        });

        it('throws an error if no default export is found', async () => {
            await expectAsync(invoke({ foo: 'bar' }, './baz.js')).toBeRejectedWithError(
                /did not provide a default export/);
        });

        it('throws an error if the default export is not a function', async () => {
            await expectAsync(invoke({ default: 'not a function' }, 'foo.js'))
                .toBeRejectedWithError(/provided a default export that was not a function/);
        });

        it('propagates an error from the default export function', async () => {
            const err = new Error('Rendering glitch.');
            await expectAsync(invoke({ default: () => { throw err; } }, './foo.js'))
                .toBeRejectedWith(err);
        });

        it('propagates a rejection from the default export function', async () => {
            const err = new Error('Rendering glitch.');
            await expectAsync(invoke({ default: () => Promise.reject(err) }, './foo.js')).toBeRejectedWith(err);
        });

        it('throws an error if the default export does not return a string', async () => {
            await expectAsync(invoke({ default: () => 1234 }, './foo.js'))
                .toBeRejectedWithError(/provided a default export which returned a value that is not one of/);
        });
    });
});

async function asyncIterableToArray<T>(input: AsyncIterable<T>):
        Promise<readonly T[]> {
    const array = [] as T[];
    for await (const value of input) {
        array.push(value);
    }
    return array;
}
