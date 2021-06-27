import { runfiles } from '@bazel/runfiles';
import * as fs from 'rules_prerender/common/fs';
import { createAnnotation } from 'rules_prerender/common/models/prerender_annotation';

/**
 * Returns a prerender annotation as a string to be included in prerendered
 * HTML. This is used by the prerender build process to include the referenced
 * CSS file in the final bundle for the page.
 */
export function includeStyle(path: string): string {
    const annotation = createAnnotation({
        type: 'style',
        path,
    });
    return `<!-- ${annotation} -->`;
}

/**
 * Reads the given CSS file at the provided runfiles path and returns it in a
 * `<style />` tag to be inlined in the document.
 */
export async function inlineStyle(path: string): Promise<string> {
    const styles = await fs.readFile(runfiles.resolve(path), 'utf-8');
    return `
<style>
${styles}
</style>
    `.trim();
}
