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
