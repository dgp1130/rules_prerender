import * as inlineStyleMap from './inline_style_map.mjs';
import { serialize } from '../../common/models/prerender_annotation.mjs';
import { inlineStyle, InlineStyleNotFoundError } from './styles.mjs';

describe('styles', () => {
    describe('inlineStyle()', () => {
        beforeEach(() => {
            inlineStyleMap.resetMapForTesting();
        });

        it('returns an inline style annotation in an HTML comment', () => {
            inlineStyleMap.setMap(new Map(Object.entries({
                'path/to/pkg/foo.css': 'some/real/file.css',
            })));

            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
            };
            const annotation = inlineStyle('./foo.css', meta);

            expect(annotation).toBe(`
<rules_prerender:annotation>${
    serialize({
        type: 'style',
        path: 'some/real/file.css',
    })
}</rules_prerender:annotation>
            `.trim());
        });

        it('returns an inline style annotation for a file in a sub directory of the given `import.meta`', () => {
            inlineStyleMap.setMap(new Map(Object.entries({
                'path/to/pkg/some/subdir/foo.css': 'some/real/file.css',
            })));

            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
            };
            const annotation = inlineStyle('./some/subdir/foo.css', meta);

            expect(annotation).toBe(`
<rules_prerender:annotation>${
    serialize({
        type: 'style',
        path: 'some/real/file.css',
    })
}</rules_prerender:annotation>
            `.trim());
        });

        it('returns an inline style annotation for a file in a parent directory of the given `import.meta`', () => {
            inlineStyleMap.setMap(new Map(Object.entries({
                'path/foo.css': 'some/real/file.css',
            })));

            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
            };
            const annotation = inlineStyle('../../foo.css', meta);

            expect(annotation).toBe(`
<rules_prerender:annotation>${
    serialize({
        type: 'style',
        path: 'some/real/file.css',
    })
}</rules_prerender:annotation>
            `.trim());
        });

        it('throws an error when the requested style import is not present', () => {
            const map = new Map(Object.entries({
                'foo/bar/baz.css': 'some/dir/baz.css',
                'hello/world.css': 'goodbye/mars.css',
            }));

            inlineStyleMap.setMap(map);

            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
            };

            expect(() => inlineStyle('./does_not_exist.css', meta))
                .toThrow(InlineStyleNotFoundError.from(
                    './does_not_exist.css', 'path/to/pkg/does_not_exist.css', map));
        });

        it('ignores the inline style map when not defined', () => {
            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
            };

            expect(inlineStyle('./foo.css', meta)).toBe(`
<rules_prerender:annotation>${
    serialize({
        type: 'style',
        path: 'path/to/pkg/foo.css',
    })
}</rules_prerender:annotation>
            `.trim());
        });

        it('throws an error when given a bare import', () => {
            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
            };

            expect(() => inlineStyle('foo', meta))
                .toThrowError(/Only relative imports are supported/);
        });

        it('throws an error when given a path without a CSS file extension', () => {
            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
            };

            expect(() => inlineStyle('./foo', meta)).toThrowError(
                /Relative imports \*must\* include file extensions/);
        });

        it('throws an error when importing outside the root', () => {
            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/my_pkg/prerender.mjs',
            };

            expect(() => inlineStyle('../../external/foo.css', meta))
                .toThrowError(/Path escapes workspace root/);
        });

        it('throws an error when importing within the workspace root but walking out of it first', () => {
            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/my_pkg/prerender.mjs',
            };

            // Technically importing `../../bin/...` is within the workspace
            // because the last directory is "bin" so `../bin` is a no-op.
            // However this becomes dependent on the last file directory name
            // being "bin", so we ban it anyways.
            expect(() => inlineStyle('../../bin/foo.css', meta))
                .toThrowError(/Path escapes workspace root/);
        });
    });
});
