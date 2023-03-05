import { wkspRelative } from './paths.mjs';

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

        it('throws an error for files outside the artifact root', () => {
            const path = '/bazel/.../execroot/my_wksp/path/to/pkg/file.txt';

            expect(() => wkspRelative(path))
                .toThrowError(/Path not in artifact root/);
        });
    });
});
