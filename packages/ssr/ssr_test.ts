import 'jasmine';

import * as fs from 'rules_prerender/common/fs';
import { render } from 'rules_prerender/packages/ssr/ssr';

describe('ssr', () => {
    describe('render()', () => {
        it('renders the given path', async () => {
            spyOn(fs, 'readFile').and.resolveTo(`
<!DOCTYPE>
<html>
    <head>
        <title>Test</title>
    </head>
    <body>
        <div>First chunk</div>
        <!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type": "ssr", "component": "foo", "data": {}} -->
        <div>Second chunk</div>
        <!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type": "ssr", "component": "bar", "data": {}} -->
        <div>Third chunk</div>
    </body>
</html>
            `.trim());

            const rendered = await concatAll(render('/foo.html'));

            expect(rendered).toBe(`
<!DOCTYPE>
<html>
    <head>
        <title>Test</title>
    </head>
    <body>
        <div>First chunk</div>
        <div>Rendered foo</div>
        <div>Second chunk</div>
        <div>Rendered bar</div>
        <div>Third chunk</div>
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
