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

    it('renders components concurrently', async () => {
        const res = await axios.get<string>(
            `http://${devserver.get().host}:${devserver.get().port}/concurrent.html`,
            { responseType: 'text' },
        );

        // Test times out in 2 seconds, but it takes 1 second to reach each item
        // in the list. To pass, components must render concurrently, or else it
        // would take a minimum of 10 seconds to render and the test would time
        // out!
        expect(res.data.trim()).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test</title>
    </head>
    <body>
        <ul>
    <li>Concurrent header</li>
    <li>Concurrent 0</li>
<li>Concurrent 1</li>
<li>Concurrent 2</li>
<li>Concurrent 3</li>
<li>Concurrent 4</li>
<li>Concurrent 5</li>
<li>Concurrent 6</li>
<li>Concurrent 7</li>
<li>Concurrent 8</li>
<li>Concurrent 9</li>
    <li>Concurrent footer</li>
</ul>
    </body>
</html>
        `.trim());
    }, 2_000 /* timeout */);

    it('server-side renders using the HTTP request as input', async () => {
        const res = await axios.get<string>(
            `http://${devserver.get().host}:${devserver.get().port}/request.html?name=foo`,
            { responseType: 'text' },
        );

        expect(res.data.trim()).toBe(`<!DOCTYPE html>
<html>
    <head>
        <title>Test</title>
    </head>
    <body>
        <ul>
    <li>Request header</li>
    <li>The \`?name\` query parameter is "foo"</li>
    <li>Request footer</li>
</ul>
    </body>
</html>
        `.trim());
    });

    it('composes SSR and SSG content', async () => {
        const res = await axios.get<string>(
            `http://${devserver.get().host}:${devserver.get().port}/composition.html`,
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
    <li>Composition header</li>
    <li>SSR: Composition</li><ul>
    <li>Composed header</li>
    <li>SSR: Composed from Composition</li>
    <li>Composed footer</li>
</ul>
    <li>Composition footer</li>
</ul>
    </body>
</html>
        `.trim());
    });

    it('supports SSR of an array of dependency components', async () => {
        const res = await axios.get<string>(
            `http://${devserver.get().host}:${devserver.get().port}/list.html`,
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
    <li>List header</li>
    <ul><li>List item header</li><li>SSR: List item: 0</li><li>SSR: List item: 1</li><li>SSR: List item: 2</li><li>SSR: List item: 3</li><li>SSR: List item: 4</li><li>SSR: List item: 5</li><li>SSR: List item: 6</li><li>SSR: List item: 7</li><li>SSR: List item: 8</li><li>SSR: List item: 9</li><li>List item footer</li></ul>
    <li>List footer</li>
</ul>
    </body>
</html>
        `.trim());
    });
});
