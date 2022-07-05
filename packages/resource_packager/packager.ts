import * as fs from '../../common/fs';
import { ResourceMap } from './resource_map';

/**
 * Copies all the provided resources to their specified URL path under the given
 * destination directory.
 * 
 * Example:
 * 
 * Given a {@param destDir} of `'bazel-out/pkg/output'` and a
 * {@link ResourceMap} which lists:
 *   /foo/bar/baz.html -> bazel-out/path/to/pkg/baz.html
 *   /hello/world.txt -> bazel-out/path/to/other/pkg/test.ext
 * `pack` would create the files:
 *   bazel-out/pkg/output/foo/bar/baz.html (with content of bazel-out/path/to/pkg/baz.html)
 *   bazel-out/pkg/hello/world.txt (with content of bazel-out/path/to/other/pkg/test.ext)
 * 
 * @param destDir The destination directory to copy all the resources to.
 * @param resources A {@link ResourceMap} which maps the desired URL paths to
 *     their source files.
 */
export async function pack(destDir: string, resources: ResourceMap):
        Promise<void> {
    // Make all the directories containing files.
    const dirs = new Set(Array.from(resources.urlPaths())
        // Drop paths at root, no directory to create.
        .filter((urlPath) => urlPath.lastIndexOf('/') !== 0)
        .map((urlPath) => urlPath.slice(1) // Drop leading `/`.
            .split('/').slice(0, -1).join('/') // Drop final filename.
        ));
    await Promise.all(Array.from(dirs.values())
        .map((dir) => fs.mkdir(`${destDir}/${dir}`, { recursive: true }))
    );

    // Copy all source files to their associated path under `destDir`.
    await Promise.all(
        Array.from(resources.entries())
            .map(([ urlPath, fileRef ]) => [
                fileRef, // Source.
                `${destDir}/${urlPath.slice(1)}`, // Destination.
            ] as const)
            .map(([ src, dest ]) => fs.copyFile(src, dest)),
    );
}
