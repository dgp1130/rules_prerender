import * as fs from 'rules_prerender/common/fs';
import { createAnnotation } from 'rules_prerender/common/models/prerender_annotation';
import { resolveRunfile } from 'rules_prerender/common/runfiles';

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

/** TODO: Document. */
export async function inlineStyle(path: string): Promise<string> {
    const styles = await fs.readFile(resolveRunfile(path), 'utf-8');
    return `<style>${styles}</style>`;
}
