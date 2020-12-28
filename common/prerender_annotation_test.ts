import 'jasmine';

import { PrerenderAnnotation, createAnnotation } from 'rules_prerender/common/prerender_annotation';

describe('prerender_annotation', () => {
    describe('PrerenderAnnotation', () => {
        it('is a union of the `type` attribute', () => {
            const annotation: PrerenderAnnotation = {
                // @ts-expect-error Not a known type attribute.
                type: 'not-a-valid-type',
            };

            expect().nothing();
        });
    });

    describe('createAnnotation()', () => {
        it('converts the given annotation to a string format', () => {
            const annotation = createAnnotation({
                type: 'script',
                path: './foo/bar/baz.js',
            });

            expect(annotation)
                    .toBe(`bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"script","path":"./foo/bar/baz.js"}`);
        });
    });
});
