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

    it('renders components in parallel', async () => {
        const res = await axios.get<string>(
            `http://${devserver.get().host}:${devserver.get().port}/parallel.html`,
            { responseType: 'text' },
        );

        // Test times out in 2 seconds, but it takes 1 second to reach each item
        // in the list. To pass, server must be parallelized, or else it would
        // take a minimum of 10 seconds to render and the test would time out!
        expect(res.data.trim()).toBe(`<!DOCTYPE html>
<html>
    <head>
        <title>Test</title>
    </head>
    <body>
        
<ul>
    <li>Parallel header</li>
    <li>Parallel 0</li>
<li>Parallel 1</li>
<li>Parallel 2</li>
<li>Parallel 3</li>
<li>Parallel 4</li>
<li>Parallel 5</li>
<li>Parallel 6</li>
<li>Parallel 7</li>
<li>Parallel 8</li>
<li>Parallel 9</li>
    <li>Parallel footer</li>
</ul>
    
    </body>
</html>
        `.trim());
    }, 2_000 /* timeout */);
});
