/**
 * @fileoverview Utilities related to Bazel runfiles.
 * See: https://docs.bazel.build/versions/3.7.0/skylark/rules.html#runfiles.
 */

import { env } from 'process';

/**
 * Returns a CWD-relative path to the given runfiles-relative file path.
 * 
 * @param path A runfiles-relative file path to a given resource. This should
 *     begin with the name of the workspace which contains the file and then
 *     include the full path to the file location. So a file at
 *     `//foo/bar:baz.txt` would exist at `rules_prerender/foo/bar/baz.txt`.
 *     This is a simple string translation, it provides no guarantees that 
 *     requested file exists or is readable.
 * @return A CWD-relative path to the requested file. For the most part you can
 *     pass this directly into any filesystem API and it will work as expected.
 */
export function resolveRunfile(path: string): string {
    // Read runfiles directory from the environment variable. We could do this
    // at the root scope, but it is easier for testing if we do this on demand
    // even if it is somewhat less performant.
    const runfiles = env['RUNFILES'];
    if (!runfiles) throw new Error('$RUNFILES not set.');

    return `${runfiles}/${path}`;
}
