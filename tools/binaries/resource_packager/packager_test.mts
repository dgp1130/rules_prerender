import { FileSystemFake } from '../../../common/file_system_fake.mjs';
import { pack } from './packager.mjs';
import { ResourceMap } from './resource_map.mjs';
import { mockFileRef } from './resource_map_mock.mjs';

describe('packager', () => {
    describe('pack()', () => {
        it('packages the given resources', async () => {
            const fs = FileSystemFake.of({
                'bazel-bin/path/to/pkg/baz.html': '<baz></baz>',
                'bazel-bin/path/to/pkg/test.html': '<test></test>',
            });

            const resources = ResourceMap.fromEntries(Object.entries({
                '/foo/bar/baz.html': 'bazel-bin/path/to/pkg/baz.html',
                '/hello/world.html': 'bazel-bin/path/to/pkg/test.html',
            }));

            const mkdirSpy = spyOn(fs, 'mkdir').and.callThrough();
            const copyFileSpy = spyOn(fs, 'copyFile').and.callThrough();

            await pack('dest', resources, fs);

            expect(mkdirSpy).toHaveBeenCalledWith('dest/foo/bar', {
                recursive: true,
            });
            expect(mkdirSpy).toHaveBeenCalledWith('dest/hello', {
                recursive: true,
            });

            expect(copyFileSpy).toHaveBeenCalledWith(
                'bazel-bin/path/to/pkg/baz.html', 'dest/foo/bar/baz.html');
            expect(copyFileSpy).toHaveBeenCalledWith(
                'bazel-bin/path/to/pkg/test.html', 'dest/hello/world.html');
        });

        it('does nothing when given no resources', async () => {
            const fs = FileSystemFake.of({});
            const mkdirSpy = spyOn(fs, 'mkdir').and.callThrough();
            const copyFileSpy = spyOn(fs, 'copyFile').and.callThrough();

            await pack('dest', ResourceMap.fromEntries(Object.entries({})), fs);

            expect(mkdirSpy).not.toHaveBeenCalled();
            expect(copyFileSpy).not.toHaveBeenCalled();
        });

        // Root output directory should already exist, having been created by
        // Bazel before the action runs.
        it('does not create the root directory', async () => {
            const fs = FileSystemFake.of({
                'bazel-bin/path/to/pkg/foo.txt': 'foo',
            });

            const mkdirSpy = spyOn(fs, 'mkdir').and.callThrough();
            spyOn(fs, 'copyFile').and.callThrough();

            const map = ResourceMap.fromEntries(Object.entries({
                '/foo.txt': 'bazel-bin/path/to/pkg/foo.txt',
            }));

            await pack('dest', map, fs);

            expect(mkdirSpy).not.toHaveBeenCalled();
        });

        it('fails when unable to make a directory', async () => {
            const fs = FileSystemFake.of({});
            const err = new Error('File system detached.');
            spyOn(fs, 'mkdir').and.rejectWith(err);
            const copyFileSpy = spyOn(fs, 'copyFile').and.callThrough();

            const map = ResourceMap.fromEntries(Object.entries({
                '/foo/bar/baz.html': mockFileRef(),
            }));

            await expectAsync(pack('dest', map, fs)).toBeRejectedWith(err);

            expect(copyFileSpy).not.toHaveBeenCalled();
        });

        it('fails when unable to copy a file', async () => {
            const fs = FileSystemFake.of({});
            const err = new Error('File system detached.');
            spyOn(fs, 'mkdir').and.callThrough();
            spyOn(fs, 'copyFile').and.rejectWith(err);

            const map = ResourceMap.fromEntries(Object.entries({
                '/foo/bar/baz.html': mockFileRef(),
            }));

            await expectAsync(pack('dest', map, fs)).toBeRejectedWith(err);
        });
    });
});
