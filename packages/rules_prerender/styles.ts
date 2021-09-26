import { runfiles } from '@bazel/runfiles';
import * as fs from 'rules_prerender/common/fs';
import { StyleInjection, createAnnotation } from 'rules_prerender/common/models/prerender_annotation';

/**
 * Returns a prerender annotation as a string to be included in prerendered
 * HTML. This is used by the prerender build process to include the referenced
 * CSS file in the final bundle for the page.
 * 
 * @path The execroot-relative path to the CSS file to include.
 * @returns An annotation to be embedded in an HTML file, which will be
 *     processed to bundle the given CSS file.
 */
export function includeStyle(path: string): string {
    const annotation = createAnnotation({
        type: 'style',
        injection: StyleInjection.Bundle,
        path,
    });
    return `<!-- ${annotation} -->`;
}

/**
 * Returns a prerender annotation as a string to be included in prerendered
 * HTML. This is used by the prerender build process to bundle and inject the
 * given CSS file at this particular location. This is most useful for
 * declarative shadow DOM, where styles must be included within the template.
 * 
 * @path The execroot-relative path to the CSS file to inline.
 * @returns An annotation to be embedded in an HTML file, which will be
 *     processed to inline the given CSS file at this location.
 */
export function inlineStyle(path: string): string {
    const annotation = createAnnotation({
        type: 'style',
        injection: StyleInjection.Inline,
        path,
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
