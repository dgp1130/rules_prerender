import { PrerenderMetadata } from '../../common/models/prerender_metadata';

/**
 * Generates a TypeScript entry point which imports all the scripts in the given
 * {@link PrerenderMetadata} object.
 * 
 * @param metadata Contains all the scripts to import in the resulting entry point.
 * @param importDepth Depth of the parent directories this tool is executed in. So if this
 *     function is run from `//foo/bar:baz`, `importDepth` would be 2 for `foo` and `bar`.
 * @returns A TypeScript source file which perform side-effectful imports of all
 *     the metadata scripts.
 */
export function generateEntryPoint(metadata: PrerenderMetadata, importDepth: number):
        string {
    const prefix = importDepth !== 0 ? range(importDepth).map(() => '..').join('/') + '/' : './';
    return metadata.scripts
        .map((script) => `import '${prefix}${script.path}';`)
        .join('\n');
}

// Like the Python `range()` function.
function range(max: number): number[] {
    return [...Array(max).keys()];
}
