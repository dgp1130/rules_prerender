/**
 * @fileoverview Bundles the given JavaScript entry points into a directory of
 * bundled output files.
 *
 * The command line arguments for this binary are passed through to Rollup
 * without modification and use the contract. The only difference that in Rollup
 * passing no input files is an error, but in `js_bundler` it is a no-op
 * success.
 */

import { execFile as execFileCb } from 'child_process';
import { promisify } from 'util';
import { main } from '../../../common/binary.mjs';

const execFile = promisify(execFileCb);

const rollup =
    `${process.env['RUNFILES']}/rules_prerender/packages/rules_prerender/rollup.sh`;

void main(async () => {
    // No files to bundle. This would be an error in Rollup, but we don't care
    // and just skip running Rollup altogether. Bazel creates the output
    // directory automatically, so we don't need to do anything, just exit
    // successfully.
    if (!process.argv.includes('-i')) return 0;

    // Drop Node parts of the argument string.
    const rollupArgs = process.argv.slice(2);

    // Execute Rollup as a subprocess.
    const proc = execFile(rollup, rollupArgs, {});

    // Pipe subprocess stdout/stderr to this process' stdout/stderr.
    proc.child.stdout?.on('data', (chunk) => {
        process.stdout.write(chunk);
    });
    proc.child.stderr?.on('data', (chunk) => {
        process.stderr.write(chunk);
    });

    // Wait for Rollup to complete.
    try {
        await proc;
    } catch {
        // No need to propagate error message, stderr is already piped to the
        // process output.
        return 1;
    }

    return 0;
});
