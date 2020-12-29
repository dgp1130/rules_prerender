import 'jasmine';

import { InjectorConfig } from 'rules_prerender/packages/resource_injector/config';
import { inject } from 'rules_prerender/packages/resource_injector/injector';

describe('injector', () => {
    describe('inject()', () => {
        it('injects the given scripts', () => {
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

            const injected = inject(input, config);

            expect(injected).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    <script src="/foo.js" type="module" async></script>
<script src="/bar.js" type="module" async></script>
<script src="/baz.js" type="module" async></script>
</head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim());
        });

        it('injects the given scripts into a new `<head />` tag', () => {
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

            const injected = inject(input, config);

            expect(injected).toBe(`
<!DOCTYPE html>
<html>
<head>
<script src="/foo.js" type="module" async></script>
</head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim());
        });

        it('injects the given scripts into a new `<head />` tag even when missing a `<!DOCTYPE>`', () => {
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

            const injected = inject(input, config);

            expect(injected).toBe(`
<html>
<head>
<script src="/foo.js" type="module" async></script>
</head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim());
        });
    });
});
