import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import axios from 'axios';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { puppeteerTestTimeout, useBrowser, usePage } from 'rules_prerender/common/testing/puppeteer';

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
    <script src="/foo.js" async defer></script>
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
    <script src="/bar.js" async defer></script>
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
    <script src="/bar.js" async defer></script>
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
    <script src="/concurrent.js" async defer></script>
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
    <script src="/request.js" async defer></script>
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
    <script src="/composition.js" async defer></script>
</head>
    <body>
        <ul>
    <li>SSG: Outer component header</li>
    <li>SSR: Outer component</li><ul>
    <li>SSG: Inner component header</li>
    <li>SSR: Inner component called by Outer component</li>
    <li>SSG: Inner component footer</li>
</ul>
    <li>SSG: Outer component footer</li>
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
    <script src="/list.js" async defer></script>
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

    describe('with Puppeteer', () => {
        const browser = useBrowser();
        const page = usePage(browser);

        it('mixes SSG, SSR, and CSR content', async () => {
            await page.get().goto(
                `http://${devserver.get().host}:${devserver.get().port}/mixed.html`,
                { waitUntil: 'load' },
            );
    
            const listItems = await page.get()
                .$$eval('li', (list) => list.map((el) => el.textContent));
            expect(listItems.length).toBe(6);

            expect(listItems[0])
                .toBe('SSG: Built in Bazel workspace `rules_prerender`.');
            expect(listItems[3])
                .toBe('SSG: Built in Bazel workspace `rules_prerender`.');

            // Health check can count as a request, and the server is longer
            // lived than one test. We don't care which request number it was.
            expect(listItems[1]).toMatch(/SSR: This was request #[0-9]+\./);
            expect(listItems[4]).toMatch(/SSR: This was request #[0-9]+\./);

            // Viewport width is dependent on Puppeteer, could hard-code it, but
            // don't care that much.
            expect(listItems[2]).toMatch(/CSR: Viewport width is [0-9]+px\./);
            expect(listItems[5]).toMatch(/CSR: Viewport width is [0-9]+px\./);
        }, puppeteerTestTimeout);
    });
});
