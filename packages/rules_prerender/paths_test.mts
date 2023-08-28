import { execrootRelative, parseExecrootRelativePath, wkspRelative } from './paths.mjs';

describe('paths', () => {
    describe('wkspRelative()', () => {
        it('returns the workspace-relative path for the given absolute input', () => {
            const path = '/bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/file.txt';
            const relative = wkspRelative(path);

            expect(relative).toBe('path/to/pkg/file.txt');
        });

        it('allows directories named "execroot"', () => {
            const path = '/bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/execroot/pkg/file.txt';
            const relative = wkspRelative(path);

            expect(relative).toBe('path/to/execroot/pkg/file.txt');
        });

        it('throws an error if there is no execroot', () => {
            const path = '/bazel/.../notanexecroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/file.txt';

            expect(() => wkspRelative(path))
                .toThrowError(/Path not in the Bazel workspace/);
        });

        it('throws an error for files outsize `bazel-out`', () => {
            const path = '/bazel/.../execroot/my_wksp/path/to/pkg/file.txt';

            expect(() => wkspRelative(path))
                .toThrowError(/Path not in `bazel-out`/);
        });

        it('throws an error for files outside the artifact root', () => {
            const path = '/bazel/.../execroot/my_wksp/bazel-out/path/to/pkg/file.txt';

            expect(() => wkspRelative(path))
                .toThrowError(/Path not in artifact root/);
        });
    });

    describe('execrootRelative()', () => {
        it('returns the execroot-relative path for the given absolute path', () => {
            const path = '/bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/file.txt';
            const relative = execrootRelative(path);

            expect(relative)
                .toBe('my_wksp/bazel-out/k8-opt/bin/path/to/pkg/file.txt');
        });

        it('allows directories to be named `execroot`', () => {
            const path = '/bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/execroot/pkg/file.txt';
            const relative = execrootRelative(path);

            expect(relative)
                .toBe('my_wksp/bazel-out/k8-opt/bin/path/to/execroot/pkg/file.txt');
        });

        it('throws an error if there is no execroot', () => {
            const path = '/bazel/.../notanexecroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/file.txt';

            expect(() => execrootRelative(path))
                .toThrowError(/Path not in the Bazel workspace/);
        });
    });

    describe('parseExecrootRelativePath()', () => {
        it('returns the parsed form of the given execroot-relative path', () => {
            const path = 'my_wksp/bazel-out/k8-opt/bin/path/to/pkg/file.txt';
            const relative = parseExecrootRelativePath(path);

            expect(relative).toEqual({
                wksp: 'my_wksp',
                cfg: 'k8-opt',
                binOrGenfiles: 'bin',
                relativePath: 'path/to/pkg/file.txt',
            });
        });

        it('throws an error for a path not in `bazel-out`', () => {
            const path =
                'my_wksp/not-bazel-out/k8-opt/bin/path/to/pkg/file.txt';
            expect(() => parseExecrootRelativePath(path))
                .toThrowError(/Path not in `bazel-out`/);
        });

        it('throws an error for a path not in the artifact root', () => {
            const path =
                'my_wksp/bazel-out/k8-opt/not-bin-or-genfiles/path/to/pkg/file.txt';
            expect(() => parseExecrootRelativePath(path))
                .toThrowError(/Path not in artifact root/);
        });
    });
});
