import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import axios from 'axios';
import { useDevserver } from 'rules_prerender/common/testing/devserver';

const server = runfiles.resolvePackageRelative('site_server.sh');

describe('ssr', () => {
    const devserver = useDevserver(server);

    it('is server-side rendered', async () => {
        const res = await axios.get<string>(
            `http://${devserver.get().host}:${devserver.get().port}/foo.html`,
            { responseType: 'text' },
        );

        expect(res.data.trim()).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test</title>
    </head>
    <body>
        <ul>
    <li>Foo header</li>
    <li>Foo component says hello via SSR to World</li>
    <li>Foo footer</li>
</ul>
    </body>
</html>
        `.trim());
    });

    it('composes an SSR component', async () => {
        const res = await axios.get<string>(
            `http://${devserver.get().host}:${devserver.get().port}/bar.html`,
            { responseType: 'text' },
        );

        expect(res.data.trim()).toBe(`<!DOCTYPE html>
<html>
    <head>
        <title>Test</title>
    </head>
    <body>
        <ul>
    <li>Bar header</li>
    <ul>
    <li>Foo header</li>
    <li>Foo component says hello via SSR to Bar</li>
    <li>Foo footer</li>
</ul>
    <li>Bar SSR</li>
    <li>Bar footer</li>
</ul>
    </body>
</html>
        `.trim());
    });

    it('streams data', async () => {
        const res = await axios.get<string>(
            `http://${devserver.get().host}:${devserver.get().port}/bar.html`,
            { responseType: 'text' },
        );

        // TODO: Assert that data was streamed.
        expect(res.data.trim()).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test</title>
    </head>
    <body>
        <ul>
    <li>Bar header</li>
    <ul>
    <li>Foo header</li>
    <li>Foo component says hello via SSR to Bar</li>
    <li>Foo footer</li>
</ul>
    <li>Bar SSR</li>
    <li>Bar footer</li>
</ul>
    </body>
</html>
        `.trim());
    });
});
