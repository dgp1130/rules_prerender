import * as path from 'path';

/** Converts the given absolute file path to a workspace-relative file path. */
export function wkspRelative(filePath: string): string {
    const execrootRelativePath = execrootRelative(filePath);
    const { relativePath } = parseExecrootRelativePath(execrootRelativePath);
    return relativePath;
}

/** Converts the given absolute file path to an execroot-relative file path. */
export function execrootRelative(filePath: string): string {
    const execrootDir = `${path.sep}execroot${path.sep}`;
    if (!filePath.includes(execrootDir)) {
        throw new Error(`Path not in the Bazel workspace: "${filePath}".`);
    }

    // Strip everything up to the first `/execroot/` directory. User code could
    // name their own directories `execroot` so we only take up to the first.
    const execrootStart = filePath.indexOf(execrootDir) + execrootDir.length;
    return filePath.slice(execrootStart);
}

export type Configuration =
    | `k8-${string}`
    | `win-${string}`
    | `darwin-${string}`;

/** A parsed format of an execroot-relative path. */
export interface ExecrootRelativePath {
    wksp: string,
    cfg: Configuration,
    binOrGenfiles: 'bin' | 'genfiles',
    relativePath: string,
}

/** Parses an execroot relative path and returns the parsed format. */
export function parseExecrootRelativePath(execrootRelativePath: string):
        ExecrootRelativePath {
    // `@aspect_rules_js` requires all the files to be in the bin directory
    // anyways, so we know those paths will always be present. If not, then the
    // user is likely depending on a source file directly and needs to
    // `copy_to_bin()`.
    const [ wksp, bazelOut, cfg, binOrGenfiles, ...relativeDirs ] =
        execrootRelativePath.split(path.sep);
    if (bazelOut !== 'bazel-out') {
        throw new Error(`Path not in \`bazel-out\`, did you forget to \`copy_to_bin()\`? "${execrootRelativePath}"`);
    }
    if (binOrGenfiles !== 'bin' && binOrGenfiles !== 'genfiles') {
        throw new Error(`Path not in artifact root, did you forget to \`copy_to_bin()\`? "${execrootRelativePath}"`);
    }

    return {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        wksp: wksp!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        cfg: cfg! as Configuration,
        binOrGenfiles,
        relativePath: relativeDirs.join(path.sep),
    };
}
