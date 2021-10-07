import 'jasmine';

import axios from 'axios';
import { runfiles } from '@bazel/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';

const server = runfiles.resolvePackageRelative('express_test_server.sh');

describe('express', () => {
    const devserver = useDevserver(server);

    it('serves a server-side rendered page', async () => {
        const res = await axios.get<string>(
            `http://${devserver.get().host}:${devserver.get().port}/index.html`,
            { responseType: 'text' },
        );
        expect(res.status).toBe(200 /* OK */);
        expect(res.data.trim()).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Express Test Page</title>
        <meta charset="utf8">
    </head>
    <body>
        <ul>
            <li>First</li>
            <li>Rendered foo</li>
            <li>Second</li>
            <li>Rendered bar</li>
            <li>Third</li>
        </ul>
    </body>
</html>
        `.trim());
    });
});
