import 'jasmine';

import { includeStyle } from 'rules_prerender/packages/rules_prerender/styles';

describe('styles', () => {
    describe('includeStyle()', () => {
        it('returns a style annotation in an HTML comment', () => {
            const annotation = includeStyle('foo/bar/baz.css');

            expect(annotation)
                    .toBe('<!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"style","path":"foo/bar/baz.css"} -->');
        });
    });
});
