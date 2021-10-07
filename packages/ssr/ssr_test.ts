import 'jasmine';

import * as fs from 'rules_prerender/common/fs';
import { render } from 'rules_prerender/packages/ssr/ssr';

describe('ssr', () => {
    describe('render()', () => {
        it('renders the given path', async () => {
            spyOn(fs, 'readFile').and.resolveTo(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test</title>
    </head>
    <body>
        <ul>
            <li>First chunk</li>
            <!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type": "ssr", "component": "foo", "data": {}} -->
            <li>Second chunk</li>
            <!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type": "ssr", "component": "bar", "data": {}} -->
            <li>Third chunk</li>
        </ul>
    </body>
</html>
            `.trim());

            const rendered = await concatAll(render('/foo.html'));

            expect(rendered).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test</title>
    </head>
    <body>
        <ul>
            <li>First chunk</li>
            <li>Rendered foo</li>
            <li>Second chunk</li>
            <li>Rendered bar</li>
            <li>Third chunk</li>
        </ul>
    </body>
</html>
            `.trim());
        });
    });
});

async function concatAll(gen: AsyncGenerator<string, void, void>):
        Promise<string> {
    const values = [] as string[];
    for await (const value of gen) {
        values.push(value);
    }
    return values.join('');
}
