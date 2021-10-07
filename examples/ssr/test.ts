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
            <li>Foo component says "Hello, World!"</li>
            <li>Second chunk</li>
            <li>Foo component says "Hello, Another World!"</li>
            <li>Third chunk</li>
            <li>Rendered bar</li>
        </ul>
    </body>
</html>
        `.trim());
    });
});
