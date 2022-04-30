import 'jasmine';

import * as fs from 'rules_prerender/common/fs';
import { createAnnotation, StyleScope } from 'rules_prerender/common/models/prerender_annotation';
import { InjectorConfig } from 'rules_prerender/packages/resource_injector/config';
import { inject } from 'rules_prerender/packages/resource_injector/injector';

describe('injector', () => {
    describe('inject()', () => {
        it('injects the given scripts', async () => {
            const input = `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim();
            const config: InjectorConfig = [
                { type: 'script', path: '/foo.js' },
                { type: 'script', path: '/bar.js' },
                { type: 'script', path: '/baz.js' },
            ];

            const injected = await inject(input, config);

            expect(injected).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    <script src="/foo.js" async defer></script>
<script src="/bar.js" async defer></script>
<script src="/baz.js" async defer></script>
</head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim());
        });

        it('injects the given scripts into a new `<head />` tag', async () => {
            const input = `
<!DOCTYPE html>
<html>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim();
            const config: InjectorConfig = [
                { type: 'script', path: '/foo.js' },
            ];

            const injected = await inject(input, config);

            expect(injected).toBe(`
<!DOCTYPE html>
<html>
<head>
<script src="/foo.js" async defer></script>
</head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim());
        });

        it('injects the given scripts into a new `<head />` tag even when missing a `<!DOCTYPE>`', async () => {
            const input = `
<html>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim();
            const config: InjectorConfig = [
                { type: 'script', path: '/foo.js' },
            ];

            const injected = await inject(input, config);

            expect(injected).toBe(`
<html>
<head>
<script src="/foo.js" async defer></script>
</head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim());
        });

        it('injects the given styles', async () => {
            const input = `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim();
            const config: InjectorConfig = [
                { type: 'style', path: 'foo.css' },
                { type: 'style', path: 'bar.css' },
                { type: 'style', path: 'baz.css' },
            ];

            spyOn(fs, 'readFile').and.returnValues(
                Promise.resolve('.foo { color: red; }'),
                Promise.resolve('.bar { color: green; }'),
                Promise.resolve('.baz { color: blue; }'),
            );

            const injected = await inject(input, config);

            expect(injected).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    <style>.foo { color: red; }</style>
<style>.bar { color: green; }</style>
<style>.baz { color: blue; }</style>
</head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim());
        });

        it('injects the given styles into a new `<head />` tag', async () => {
            const input = `
<!DOCTYPE html>
<html>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim();
            const config: InjectorConfig = [
                { type: 'style', path: 'foo.css' },
            ];

            spyOn(fs, 'readFile').and.resolveTo('.foo { color: red; }');

            const injected = await inject(input, config);

            expect(injected).toBe(`
<!DOCTYPE html>
<html>
<head>
<style>.foo { color: red; }</style>
</head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim());
        });

        it('injects the given styles into a new `<head />` tag even when missing a `<!DOCTYPE>`', async () => {
            const input = `
<html>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim();
            const config: InjectorConfig = [
                { type: 'style', path: 'foo.css' },
            ];

            spyOn(fs, 'readFile').and.resolveTo('.foo { color: red; }');

            const injected = await inject(input, config);

            expect(injected).toBe(`
<html>
<head>
<style>.foo { color: red; }</style>
</head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim());
        });

        it('inlines style annotations', async () => {
            const annotation = createAnnotation({
                type: 'style',
                path: 'foo.css',
                scope: StyleScope.Inline,
            });

            const input = `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Hello, World!</h2>
        <!-- ${annotation} -->
    </body>
</html>
            `.trim();

            spyOn(fs, 'readFile').and.resolveTo('.foo { color: red; }');

            const injected = await inject(input, []);
            expect(fs.readFile).toHaveBeenCalledWith('foo.css', 'utf-8');

            expect(injected).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Hello, World!</h2>
        <style>.foo { color: red; }</style>
    </body>
</html>
            `.trim());
        });

        it('throws on any annotations other than inline style annotations', async () => {
            // Should fail when given a script annotation.
            const scriptAnnotation = createAnnotation({
                type: 'script',
                path: 'foo.js',
            });
            const inputWithScriptAnnotation = `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Hello, World!</h2>
        <!-- ${scriptAnnotation} -->
    </body>
</html>
            `.trim();
            await expectAsync(inject(inputWithScriptAnnotation, []))
                .toBeRejectedWithError(
                    /Injector found an annotation which is not an inline style/);

            // Should fail when given a global style annotation.
            const globalStyleAnnotation = createAnnotation({
                type: 'style',
                path: 'foo.css',
                scope: StyleScope.Global,
            });
            const inputWithGlobalStyleAnnotation = `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Hello, World!</h2>
        <!-- ${globalStyleAnnotation} -->
    </body>
</html>
            `.trim();
            await expectAsync(inject(inputWithGlobalStyleAnnotation, []))
                .toBeRejectedWithError(
                    /Injector found an annotation which is not an inline style/);
        });
    });
});
