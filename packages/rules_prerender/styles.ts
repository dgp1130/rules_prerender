import { runfiles } from '@bazel/runfiles';
import * as fs from 'rules_prerender/common/fs';
import { createAnnotation, StyleScope } from 'rules_prerender/common/models/prerender_annotation';
import { getMap as getInlineStyleMap } from 'rules_prerender/packages/rules_prerender/inline_style_map';

/**
 * Returns a prerender annotation as a string to be included in prerendered
 * HTML. This is used by the prerender build process to include the referenced
 * CSS file in the final bundle for the page.
 */
export function includeStyle(path: string): string {
    const annotation = createAnnotation({
        type: 'style',
        scope: StyleScope.Global,
        path,
    });
    return `<!-- ${annotation} -->`;
}

/**
 * Returns a prerender annotation as a string to be included in prerendered
 * HTML. This is used by the prerender build process to inline the referenced
 * CSS file at the annotation's location in the page.
 */
export function inlineStyle(importPath: string): string {
    // Look up the import path in the inline style map to get its actual file
    // path on disk. This will always exist when executed as part of the
    // renderer, however tests which directly call components won't set the
    // inline style map and it won't exist. In these cases, we just ignore it
    // since such tests would not actually care.
    const inlineStyleMap = getInlineStyleMap();
    const filePath = inlineStyleMap ? inlineStyleMap.get(importPath) : importPath;
    if (!filePath) {
        throw new Error(`Could not find "${
            importPath}" in the inline style map. Available imports are:\n\n${
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            Array.from(inlineStyleMap!.keys()).join('\n')}`);
    }

    // Return an annotation with the real file path.
    const annotation = createAnnotation({
        type: 'style',
        scope: StyleScope.Inline,
        path: filePath,
    });
    return `<!-- ${annotation} -->`;
}

/**
 * Reads the given CSS file at the provided runfiles path and returns it in a
 * `<style />` tag to be inlined in the document.
 */
export async function inlineStyleLegacy(path: string): Promise<string> {
    const styles = await fs.readFile(runfiles.resolve(path), 'utf-8');
    return `
<style>
${styles}
</style>
    `.trim();
}
