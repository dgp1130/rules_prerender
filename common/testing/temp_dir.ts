import { promises as fs } from 'fs';
import { env } from 'process';
import { Effect, useForEach } from './effects';

/**
 * Creates an {@link Effect} of a temporary directory. The directory is deleted
 * and recreated between each test, possibly using a different path.
 * 
 * @param testonly Receives injected dependencies to ease testing. Do not use in
 *     production code.
 * @return An {@link Effect} of a `string` which is a path to an empty temporary
 *     directory for use in tests.
 */
export function useTempDir({ testonly }: {
    testonly?: {
        mkdtemp?: typeof fs.mkdtemp,
        rmdir?: typeof fs.rmdir,
    },
} = { }): Effect<string> {
    const mkdtemp = testonly?.mkdtemp ?? fs.mkdtemp;
    const rmdir = testonly?.rmdir ?? fs.rmdir;

    // Read test temporary directory from the environment variable. We could do
    // this at the root scope, but it is easier for testing if we do this on
    // demand even if it is somewhat less performant.
    const testTmpDir = env['TEST_TMPDIR'];
    if (!testTmpDir) throw new Error('$TEST_TMPDIR not set.');

    return useForEach(async () => {
        // Make a fresh temp directory under the test directory to avoid
        // conflicting with other resources. The directory is given a prefix of
        // `useTempDir` so it can be traced back to this if someone finds it at
        // runtime and is confused about why it exists.
        const tmpDir = await mkdtemp(`${testTmpDir}/useTempDir-`);

        return [
            tmpDir,
            async () => {
                // Delete the temporary directory.
                await rmdir(tmpDir, { recursive: true });
            },
        ];
    });
}
