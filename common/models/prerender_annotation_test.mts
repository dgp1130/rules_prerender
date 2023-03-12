import { PrerenderAnnotation, serialize, deserialize, ScriptAnnotation, annotationsEqual, StyleAnnotation } from './prerender_annotation.mjs';

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

    describe('serialize()', () => {
        it('converts the given annotation to a string format', () => {
            const annotation = serialize({
                type: 'script',
                path: './foo/bar/baz.js',
            });

            expect(annotation).toBe(`
{
    "type": "script",
    "path": "./foo/bar/baz.js"
}
            `.trim());
        });
    });

    describe('deserialize()', () => {
        it('returns the parsed annotation', () => {
            const annotation = deserialize(`
{
    "type": "script",
    "path": "./foo/bar/baz.js"
}
            `.trim());
            expect(annotation).toEqual({
                type: 'script',
                path: './foo/bar/baz.js',
            });
        });

        it('throws when not given valid JSON', () => {
            expect(() => deserialize('not JSON')).toThrow();
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
