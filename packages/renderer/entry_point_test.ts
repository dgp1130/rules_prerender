import 'jasmine';

import { PrerenderResource } from 'rules_prerender/common/models/prerender_resource';
import { invoke } from 'rules_prerender/packages/renderer/entry_point';
import * as importLib from 'rules_prerender/packages/renderer/dynamic_import';

describe('entry_point', () => {
    describe('invoke()', () => {
        it('invokes the given entry point and returns its string value', async () => {
            const defaultExport = jasmine.createSpy('defaultExport')
                    .and.returnValue('Hello, World!');
            spyOn(importLib, 'dynamicImport').and.resolveTo({
                default: defaultExport,
            });

            const rendered = await invoke('foo.js');

            expect(importLib.dynamicImport).toHaveBeenCalledOnceWith('foo.js');
            expect(defaultExport).toHaveBeenCalledOnceWith();

            expect(rendered).toBe('Hello, World!');
        });

        it('invokes the given entry point and awaits its `Promise<string>` value', async () => {
            const defaultExport = jasmine.createSpy('defaultExport')
                    .and.resolveTo('Hello, World!');
            spyOn(importLib, 'dynamicImport').and.resolveTo({
                default: defaultExport,
            });

            const rendered = await invoke('foo.js');

            expect(rendered).toBe('Hello, World!');
        });

        it('invokes the given entry point and returns its `Iterable<PrerenderResource>` value', async () => {
            const defaultExport =
                jasmine.createSpy('defaultExport').and.returnValue([
                    PrerenderResource.of('/foo.html', 'Hello, foo!'),
                    PrerenderResource.of('/bar.html', 'Hello, bar!'),
                    PrerenderResource.of('/baz.html', 'Hello, baz!'),
                ]);
            spyOn(importLib, 'dynamicImport').and.resolveTo({
                default: defaultExport,
            });

            const rendered = await invoke('foo.js');

            expect((rendered as any)[Symbol.iterator]).toBeDefined();
            expect(Array.from(rendered as Iterable<PrerenderResource>))
                .toEqual([
                    PrerenderResource.of('/foo.html', 'Hello, foo!'),
                    PrerenderResource.of('/bar.html', 'Hello, bar!'),
                    PrerenderResource.of('/baz.html', 'Hello, baz!'),
                ]);
        });

        it('invokes the given entry point and awaits its `Promise<Iterable<PrerenderResource>>` value', async () => {
            const defaultExport =
                jasmine.createSpy('defaultExport').and.resolveTo([
                    PrerenderResource.of('/foo.html', 'Hello, foo!'),
                    PrerenderResource.of('/bar.html', 'Hello, bar!'),
                    PrerenderResource.of('/baz.html', 'Hello, baz!'),
                ]);
            spyOn(importLib, 'dynamicImport').and.resolveTo({
                default: defaultExport,
            });

            const rendered = await invoke('foo.js');

            expect((rendered as any)[Symbol.iterator]).toBeDefined();
            expect(Array.from(rendered as Iterable<PrerenderResource>))
                .toEqual([
                    PrerenderResource.of('/foo.html', 'Hello, foo!'),
                    PrerenderResource.of('/bar.html', 'Hello, bar!'),
                    PrerenderResource.of('/baz.html', 'Hello, baz!'),
                ]);
        });

        it('invokes the given entry point and returns its `AsyncIterable<PrerenderResource>` value', async () => {
            const defaultExport = jasmine.createSpy('defaultExport')
                .and.returnValue(async function* () {
                    yield PrerenderResource.of('/foo.html', 'Hello, foo!');
                    yield PrerenderResource.of('/bar.html', 'Hello, bar!');
                    yield PrerenderResource.of('/baz.html', 'Hello, baz!');
                }());
            spyOn(importLib, 'dynamicImport').and.resolveTo({
                default: defaultExport,
            });

            const rendered = await invoke('foo.js');

            expect((rendered as any)[Symbol.asyncIterator]).toBeDefined();
            const renderedArray = await asyncIterableToArray(
                rendered as AsyncIterable<PrerenderResource>);
            expect(renderedArray).toEqual([
                PrerenderResource.of('/foo.html', 'Hello, foo!'),
                PrerenderResource.of('/bar.html', 'Hello, bar!'),
                PrerenderResource.of('/baz.html', 'Hello, baz!'),
            ]);
        });

        it('throws an error if unable to import the module', async () => {
            const err = new Error('Unexpected keyword "import".');
            spyOn(importLib, 'dynamicImport').and.rejectWith(err);

            await expectAsync(invoke('foo.js')).toBeRejectedWith(err);
        });

        it('throws an error if the imported module is not an object', async () => {
            spyOn(importLib, 'dynamicImport').and.resolveTo('not an object');

            await expectAsync(invoke('foo.js')).toBeRejectedWithError(
                    /did not export a CommonJS module/);
        });

        it('throws an error if no default export is found', async () => {
            spyOn(importLib, 'dynamicImport').and.resolveTo({
                bar: 'baz',
                // No `default` export.
            });

            await expectAsync(invoke('foo.js')).toBeRejectedWithError(
                    /did not provide a default export/);
        });

        it('throws an error if the default export is not a function', async () => {
            spyOn(importLib, 'dynamicImport').and.resolveTo({
                default: 'not a function',
            });

            await expectAsync(invoke('foo.js')).toBeRejectedWithError(
                    /provided a default export that was not a function/);
        });

        it('propagates an error from the default export function', async () => {
            const err = new Error('Rendering glitch.');
            spyOn(importLib, 'dynamicImport').and.resolveTo({
                default: () => { throw err; },
            });

            await expectAsync(invoke('foo.js')).toBeRejectedWith(err);
        });

        it('propagates a rejection from the default export function', async () => {
            const err = new Error('Rendering glitch.');
            spyOn(importLib, 'dynamicImport').and.resolveTo({
                default: async () => { throw err; }, // async function.
            });

            await expectAsync(invoke('foo.js')).toBeRejectedWith(err);
        });

        it('throws an error if the default export does not return a string', async () => {
            spyOn(importLib, 'dynamicImport').and.resolveTo({
                default: () => 1234,
            });

            await expectAsync(invoke('foo.js')).toBeRejectedWithError(
                /provided a default export which returned a value that is not one of/);
        });
    });
});

async function asyncIterableToArray<T>(input: AsyncIterable<T>):
        Promise<ReadonlyArray<T>> {
    const array = [] as T[];
    for await (const value of input) {
        array.push(value);
    }
    return array;
}
