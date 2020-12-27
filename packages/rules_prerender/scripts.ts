import { createAnnotation } from 'rules_prerender/common/prerender_annotation';

/**
 * Returns a prerender annotation as a string to be included in prerendered
 * HTML. This is used by the prerender build process to include the referenced
 * client-side JavaScript file in the final bundle for the page.
 */
export function includeScript(path: string): string {
    return createAnnotation({
        type: 'script',
        path,
    });
}
