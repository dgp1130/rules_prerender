import { parse, HTMLElement } from 'node-html-parser';
import { PrerenderAnnotation } from '../../../common/models/prerender_annotation.mjs';
import { walkAllAnnotations } from '../../../common/prerender_annotation_walker.mjs';

/**
 * Parses the given string as HTML and return a tuple of the input HTML with
 * annotation comments removed and a list of those parsed annotations.
 * 
 * @param html The HTML string to parse.
 * @returns A tuple of two elements. The first element is the input HTML with
 *     all annotation comments removed. The second element is a list of
 *     parsed annotations found within the input HTML.
 */
export function extract(html: string): [
    strippedHtml: string,
    annotations: PrerenderAnnotation[],
] {
    const root = parse(html, {
        comment: true,
        blockTextElements: {
            script: true,
            noscript: true,
            style: true,
            pre: true,
        },
    });

    // Read all annotations from the HTML **and** remove the comments they come
    // from. This actually applies a side effect of modifying the document.
    const annotations = Array.from(stripAnnotations(root));

    return [ root.toString(), annotations ];
}

/**
 * Removes all annotations under the given root node (except inline styles) and
 * returns them.
 */
function* stripAnnotations(root: HTMLElement):
        Generator<PrerenderAnnotation, void, void> {
    for (const node of walkAllAnnotations(root)) {
        // Ignore styles as they are handled in a later part of the BUILD  pipeline.
        // Extracting them here would lose the context of where each style is
        // supposed to be inlined.
        if (node.annotation.type === 'style') continue;

        node.remove();
        yield node.annotation;
    }
}
