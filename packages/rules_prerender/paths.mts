import * as path from 'path';

/** Converts the given absolute file path to a workspace-relative file path. */
export function wkspRelative(filePath: string): string {
    const execrootDir = `${path.sep}execroot${path.sep}`;
    if (!filePath.includes(execrootDir)) {
        throw new Error(`Path not in the Bazel workspace: "${filePath}".`);
    }

    // Strip everything up to the first `/execroot/` directory. User code could
    // name their own directories `execroot` so we only take up to the first.
    const execrootStart = filePath.indexOf(execrootDir) + execrootDir.length;
    const execrootRelativePath = filePath.slice(execrootStart);

    // Drop leading `wksp/bazel-out/${cfg}/bin/` directories. `@aspect_rules_js`
    // requires all the files to be in the bin directory anyways, so we know
    // those paths will always need to be removed. If not, then the user is
    // likely depending on a source file directly and needs to `copy_to_bin()`.
    const [ _wksp, bazelOut, _cfg, binOrGenfiles, ...relativeDirs ] =
        execrootRelativePath.split(path.sep);
    if (bazelOut !== 'bazel-out' || (binOrGenfiles !== 'bin' && binOrGenfiles !== 'genfiles')) {
        throw new Error(`Path not in artifact root, did you forget to \`copy_to_bin()\`? "${execrootRelativePath}"`);
    }

    return relativeDirs.join(path.sep);
}
