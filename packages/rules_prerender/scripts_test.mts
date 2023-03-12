import { serialize } from '../../common/models/prerender_annotation.mjs';
import { includeScript } from './scripts.mjs';

describe('scripts', () => {
    describe('includeScript()', () => {
        it('creates an annotation to include the given script relative to the provided `import.meta`', () => {
            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
            };
            const annotation = includeScript('./baz.mjs', meta);

            expect(annotation).toBe(`
<rules_prerender:annotation>${
    serialize({
        type: 'script',
        path: 'path/to/pkg/baz.mjs',
    })
}</rules_prerender:annotation>
            `.trim());
        });

        it('creates an annotation for a script in a sub directory of the given `import.meta`', () => {
            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
            };
            const annotation = includeScript('./some/subdir/foo.mjs', meta);

            expect(annotation).toBe(`
<rules_prerender:annotation>${
    serialize({
        type: 'script',
        path: 'path/to/pkg/some/subdir/foo.mjs',
    })
}</rules_prerender:annotation>
            `.trim());
        });

        it('creates an annotation for a script in a parent directory of the given `import.meta`', () => {
            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
            };
            const annotation = includeScript('../../foo.mjs', meta);

            expect(annotation).toBe(`
<rules_prerender:annotation>${
    serialize({
        type: 'script',
        path: 'path/foo.mjs',
    })
}</rules_prerender:annotation>
            `.trim());
        });

        it('creates annotations for relative paths with common JS extensions', () => {
            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
            };

            expect(() => includeScript('./foo.js', meta)).not.toThrow();
            expect(() => includeScript('./foo.cjs', meta)).not.toThrow();
            expect(() => includeScript('./foo.mjs', meta)).not.toThrow();
        });

        it('throws an error when given a relative path without a file extension', () => {
            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
            };

            expect(() => includeScript('./foo', meta))
                .toThrowError(/Relative import/);
        });

        it('throws an error when given a bare import', () => {
            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
            };

            expect(() => includeScript('foo', meta))
                .toThrowError(/Only relative imports are supported/);
            expect(() => includeScript('foo/bar.js', meta))
                .toThrowError(/Only relative imports are supported/);
        });

        it('throws an error when importing outside the root', () => {
            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/my_pkg/prerender.mjs',
            };

            expect(() => includeScript('../../external/foo.mjs', meta))
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
            expect(() => includeScript('../../bin/foo.mjs', meta))
                .toThrowError(/Path escapes workspace root/);
        });
    });
});
