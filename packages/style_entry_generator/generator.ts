import { PrerenderMetadata, StyleScope } from 'rules_prerender/common/models/prerender_metadata';

/**
 * Generates a CSS entry point which imports all the styles in the given
 * {@link PrerenderMetadata} object.
 * 
 * @param metadata Contains all the styles to import in the resulting entry
 *     point.
 * @returns A CSS source file which includes imports of all styles in the given
 *     metadata object.
 */
export function generateEntryPoint(metadata: PrerenderMetadata): string {
    return metadata.styles
        .filter((style) => style.scope === StyleScope.Global)
        .map((style) => `@import '${style.path}';`)
        .join('\n');
}
