import { FileSystemFake } from '../../../common/file_system_fake.mjs';
import { serialize } from '../../../common/models/prerender_annotation.mjs';
import { InjectorConfig } from './config.mjs';
import { inject } from './injector.mjs';

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
    <script src="/foo.js" type="module"></script>
<script src="/bar.js" type="module"></script>
<script src="/baz.js" type="module"></script>
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
<script src="/foo.js" type="module"></script>
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
<script src="/foo.js" type="module"></script>
</head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim());
        });

        it('inlines style annotations', async () => {
            const annotation = serialize({ type: 'style', path: 'foo.css' });

            const input = `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Hello, World!</h2>
        <rules_prerender:annotation>${annotation}</rules_prerender:annotation>
    </body>
</html>
            `.trim();

            const fs = FileSystemFake.of({
                'foo.css': '.foo { color: red; }',
            });
            const readFileSpy = spyOn(fs, 'readFile').and.callThrough();

            const injected = await inject(input, [], fs);
            expect(readFileSpy).toHaveBeenCalledWith('foo.css', 'utf8');

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
            const scriptAnnotation = serialize({
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
        <rules_prerender:annotation>${scriptAnnotation}</rules_prerender:annotation>
    </body>
</html>
            `.trim();
            await expectAsync(inject(inputWithScriptAnnotation, []))
                .toBeRejectedWithError(
                    /Injector found an annotation which is not a style/);
        });
    });
});
