import 'jasmine';

import { includeScript } from 'rules_prerender/packages/rules_prerender/scripts';

describe('scripts', () => {
    describe('includeScript()', () => {
        it('creates an annotation to include the given script', () => {
            const annotation = includeScript('./foo/bar/baz.js');

            expect(annotation)
                .toBe(`<!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"script","path":"./foo/bar/baz.js"} -->`);
        });
    });
});
