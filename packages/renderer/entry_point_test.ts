import 'jasmine';

import { invoke } from './entry_point';
import * as importLib from './dynamic_import';

describe('entry_point', () => {
    describe('invoke()', () => {
        it('invokes the given entry point', async () => {
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

        it('invokes the given entry point and awaits it', async () => {
            const defaultExport = jasmine.createSpy('defaultExport')
                    .and.resolveTo('Hello, World!');
            spyOn(importLib, 'dynamicImport').and.resolveTo({
                default: defaultExport,
            });

            const rendered = await invoke('foo.js');

            expect(importLib.dynamicImport).toHaveBeenCalledOnceWith('foo.js');
            expect(defaultExport).toHaveBeenCalledOnceWith();

            expect(rendered).toBe('Hello, World!');
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
                    /provided a default export which returned\/resolved a non-string value/);
        });
    });
});
