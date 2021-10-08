import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import axios from 'axios';
import { useDevserver } from 'rules_prerender/common/testing/devserver';

const server = runfiles.resolvePackageRelative('site_server.sh');

describe('ssr', () => {
    const devserver = useDevserver(server);

    it('is server-side rendered', async () => {
        const res = await axios.get<string>(
            `http://${devserver.get().host}:${devserver.get().port}/index.html`,
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
            <li>First chunk</li>
            <ul>
    <li>Foo header</li>
    <li>Foo component says hello via SSR to World</li>
    <li>Foo footer</li>
</ul>
            <li>Second chunk</li>
            <li>Rendered bar 0</li><li>Rendered bar 1</li><li>Rendered bar 2</li><li>Rendered bar 3</li><li>Rendered bar 4</li>
            <li>Foo component says hello via SSR to Another World</li>
            <li>Third chunk</li>
        </ul>
    </body>
</html>
        `.trim());
    });
});
