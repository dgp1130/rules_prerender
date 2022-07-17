import { PrerenderMetadata } from '../../common/models/prerender_metadata';

/**
 * Generates a TypeScript entry point which imports all the scripts in the given
 * {@link PrerenderMetadata} object.
 * 
 * @param metadata Contains all the scripts to import in the resulting entry
 *     point.
 * @returns A TypeScript source file which perform side-effectful imports of all
 *     the metadata scripts.
 */
export function generateEntryPoint(metadata: PrerenderMetadata, importDepth: number):
        string {
    return metadata.scripts
        .map((script) => `import '${makeWorkspaceRelative(script.path, importDepth)}';`)
        .join('\n');
}

function makeWorkspaceRelative(path: string, importDepth: number): string {
    // Bare import specifiers are left alone (likely NPM packages).
    if (!path.startsWith('./')) return path;

    // If imported from the workspace root, nothing to change.
    if (importDepth === 0) return path;

    const prefix = range(importDepth).map(() => '..').join('/');
    return `${prefix}/${path}`;
}

// Like the Python `range()` function.
function range(max: number): number[] {
    return [...Array(max).keys()];
}
