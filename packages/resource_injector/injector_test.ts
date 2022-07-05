import 'jasmine';

import * as fs from '../../common/fs';
import { createAnnotation } from '../../common/models/prerender_annotation';
import { InjectorConfig } from './config';
import { inject } from './injector';

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

        it('inlines style annotations', async () => {
            const annotation = createAnnotation({ type: 'style', path: 'foo.css' });

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

        it('throws on any annotations other than style annotations', async () => {
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
                    /Injector found an annotation which is not a style/);
        });
    });
});
