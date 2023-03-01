import { PrerenderAnnotation, createAnnotation, parseAnnotation, ScriptAnnotation, annotationsEqual, StyleAnnotation } from './prerender_annotation.mjs';

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
            const first: StyleAnnotation = { type: 'style', path: 'foo.css' };
            const second: StyleAnnotation = { type: 'style', path: 'foo.css' };

            expect(annotationsEqual(first, second)).toBeTrue();
        });

        it('returns `false` when given different subtypes of `PrerenderAnnotation`', () => {
            const first: ScriptAnnotation = { type: 'script', path: 'foo' };
            const second: StyleAnnotation = { type: 'style', path: 'foo' };

            expect(annotationsEqual(first, second)).toBeFalse();
        });

        it('returns `false` when given `ScriptAnnotations` with different paths', () => {
            const first: ScriptAnnotation = { type: 'script', path: 'foo.js' };
            const second: ScriptAnnotation = { type: 'script', path: 'bar.js' };

            expect(annotationsEqual(first, second)).toBeFalse();
        });

        it('returns `false` when given `StyleAnnotations` with different paths', () => {
            const first: StyleAnnotation = { type: 'style', path: 'foo.css' };
            const second: StyleAnnotation = { type: 'style', path: 'bar.css' };

            expect(annotationsEqual(first, second)).toBeFalse();
        });
    });
});
