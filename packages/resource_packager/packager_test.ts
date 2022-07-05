import 'jasmine';

import * as fs from '../../common/fs';
import { pack } from './packager';
import { ResourceMap } from './resource_map';
import { mockFileRef } from './resource_map_mock';

describe('packager', () => {
    describe('pack()', () => {
        it('packages the given resources', async () => {
            const resources = ResourceMap.fromEntries(Object.entries({
                '/foo/bar/baz.html': 'bazel-bin/path/to/pkg/baz.html',
                '/hello/world.html': 'bazel-bin/path/to/pkg/test.html',
            }));

            spyOn(fs, 'mkdir').and.resolveTo();
            spyOn(fs, 'copyFile').and.resolveTo();

            await pack('dest', resources);

            expect(fs.mkdir).toHaveBeenCalledWith('dest/foo/bar', {
                recursive: true,
            });
            expect(fs.mkdir).toHaveBeenCalledWith('dest/hello', {
                recursive: true,
            });

            expect(fs.copyFile).toHaveBeenCalledWith(
                'bazel-bin/path/to/pkg/baz.html', 'dest/foo/bar/baz.html');
            expect(fs.copyFile).toHaveBeenCalledWith(
                'bazel-bin/path/to/pkg/test.html', 'dest/hello/world.html');
        });

        it('does nothing when given no resources', async () => {
            spyOn(fs, 'mkdir');
            spyOn(fs, 'copyFile');

            await pack('dest', ResourceMap.fromEntries(Object.entries({})));

            expect(fs.mkdir).not.toHaveBeenCalled();
            expect(fs.copyFile).not.toHaveBeenCalled();
        });

        // Root output directory should already exist, having been created by
        // Bazel before the action runs.
        it('does not create the root directory', async () => {
            spyOn(fs, 'mkdir');
            spyOn(fs, 'copyFile').and.resolveTo();

            const map = ResourceMap.fromEntries(Object.entries({
                '/foo.txt': mockFileRef(),
            }));

            await pack('dest', map);

            expect(fs.mkdir).not.toHaveBeenCalled();
        });

        it('fails when unable to make a directory', async () => {
            const err = new Error('File system detached.');
            spyOn(fs, 'mkdir').and.rejectWith(err);
            spyOn(fs, 'copyFile');

            const map = ResourceMap.fromEntries(Object.entries({
                '/foo/bar/baz.html': mockFileRef(),
            }));

            await expectAsync(pack('dest', map)).toBeRejectedWith(err);
            
            expect(fs.copyFile).not.toHaveBeenCalled();
        });

        it('fails when unable to copy a file', async () => {
            const err = new Error('File system detached.');
            spyOn(fs, 'mkdir').and.resolveTo();
            spyOn(fs, 'copyFile').and.rejectWith(err);

            const map = ResourceMap.fromEntries(Object.entries({
                '/foo/bar/baz.html': mockFileRef(),
            }));

            await expectAsync(pack('dest', map)).toBeRejectedWith(err);
        });
    });
});
