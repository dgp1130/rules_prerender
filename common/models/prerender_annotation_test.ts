import 'jasmine';

import { PrerenderAnnotation, createAnnotation, parseAnnotation, ScriptAnnotation, annotationsEqual, StyleAnnotation, StyleScope, isInlineStyle } from 'rules_prerender/common/models/prerender_annotation';

describe('prerender_annotation', () => {
    describe('PrerenderAnnotation', () => {
        it('is a union of the `type` attribute', () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                .toBe('bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"script","path":"./foo/bar/baz.js"}');
        });
    });

    describe('parseAnnotation()', () => {
        it('returns the parsed annotation', () => {
            const annotation = parseAnnotation(
                'bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"script","path":"./foo/bar/baz.js"}');
            expect(annotation).toEqual({
                type: 'script',
                path: './foo/bar/baz.js',
            });
        });

        it('returns parsed annotation when given extra spacing', () => {
            // Comments often have leading and trailing whitespace which should
            // be ignored.
            const annotation = parseAnnotation('  bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"script","path":"./foo/bar/baz.js"}   ');
            expect(annotation).toEqual({
                type: 'script',
                path: './foo/bar/baz.js',
            });
        });

        it('returns `undefined` when not given an annotation', () => {
            const annotation1 = parseAnnotation('wrong prefix');
            expect(annotation1).toBeUndefined();

            const annotation2 = parseAnnotation('bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE no following hyphen');
            expect(annotation2).toBeUndefined();
        });

        it('throws when not given valid JSON', () => {
            expect(() => parseAnnotation(
                'bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - not JSON'))
                .toThrow();
        });
    });

    describe('annotationsEqual()', () => {
        it('returns `true` when given two equivalent `ScriptAnnotations`', () => {
            const first: ScriptAnnotation = { type: 'script', path: 'foo.js' };
            const second: ScriptAnnotation = { type: 'script', path: 'foo.js' };

            expect(annotationsEqual(first, second)).toBeTrue();
        });

        it('returns `true` when given two equivalent `StyleAnnotations`', () => {
            const first: StyleAnnotation = {
                type: 'style',
                path: 'foo.css',
                scope: StyleScope.Global,
            };
            const second: StyleAnnotation = {
                type: 'style',
                path: 'foo.css',
                scope: StyleScope.Global,
            };

            expect(annotationsEqual(first, second)).toBeTrue();
        });

        it('returns `false` when given different subtypes of `PrerenderAnnotation`', () => {
            const first: ScriptAnnotation = { type: 'script', path: 'foo' };
            const second: StyleAnnotation = {
                type: 'style',
                path: 'foo',
                scope: StyleScope.Global,
            };

            expect(annotationsEqual(first, second)).toBeFalse();
        });

        it('returns `false` when given `ScriptAnnotations` with different paths', () => {
            const first: ScriptAnnotation = { type: 'script', path: 'foo.js' };
            const second: ScriptAnnotation = { type: 'script', path: 'bar.js' };

            expect(annotationsEqual(first, second)).toBeFalse();
        });

        it('returns `false` when given `StyleAnnotations` with different paths', () => {
            const first: StyleAnnotation = {
                type: 'style',
                path: 'foo.css',
                scope: StyleScope.Global,
            };
            const second: StyleAnnotation = {
                type: 'style',
                path: 'bar.css',
                scope: StyleScope.Global,
            };

            expect(annotationsEqual(first, second)).toBeFalse();
        });

        it('returns `false` when given `StyleAnnotations` with different scopes', () => {
            const first: StyleAnnotation = {
                type: 'style',
                path: 'foo.css',
                scope: StyleScope.Global,
            };
            const second: StyleAnnotation = {
                type: 'style',
                path: 'foo.css',
                scope: StyleScope.Inline,
            };

            expect(annotationsEqual(first, second)).toBeFalse();
        });
    });

    describe('isInlineStyle()', () => {
        it('returns `true` when given an inline style', () => {
            const annotation: StyleAnnotation = {
                type: 'style',
                path: 'foo.css',
                scope: StyleScope.Inline,
            };

            expect(isInlineStyle(annotation)).toBeTrue();
        });

        it('returns `false` when given a `ScriptAnnotation`', () => {
            const annotation: ScriptAnnotation = { type: 'script', path: 'foo.js' };

            expect(isInlineStyle(annotation)).toBeFalse();
        });

        it('returns `false` when given a globally scoped `StyleAnnotation`', () => {
            const annotation: StyleAnnotation = {
                type: 'style',
                path: 'foo.css',
                scope: StyleScope.Global,
            };

            expect(isInlineStyle(annotation)).toBeFalse();
        });
    });
});
