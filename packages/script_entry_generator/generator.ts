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
export function generateEntryPoint(metadata: PrerenderMetadata): string {
    return metadata.scripts
        .map((script) => `import '${script.path}';`)
        .join('\n');
}
