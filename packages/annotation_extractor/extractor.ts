import { parse, HTMLElement, Node } from 'node-html-parser';
import { PrerenderAnnotation, parseAnnotation } from 'rules_prerender/common/models/prerender_annotation';

type PrerenderType = PrerenderAnnotation['type'];

/**
 * Parses the given string as HTML and return a tuple of the input HTML with
 * annotation comments removed and a list of those parsed annotations.
 * 
 * @param html The HTML string to parse.
 * @returns A tuple of two elements. The first element is the input HTML with
 *     all annotation comments removed. The second element is a list of
 *     parsed annotations found within the input HTML.
 */
export function extract(html: string, typesToKeep: Set<PrerenderType> = new Set()): [
    string /* strippedHtml */,
    Array<PrerenderAnnotation> /* annotations */,
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
    const annotations = Array.from(stripAnnotations(
        walkTemplates(walk(root)),
        typesToKeep,
    ));

    return [ root.toString(), annotations ];
}

/**
 * Checks each given comment to see if it is an annotation. If so, the comment
 * is removed from the document and the annotation is yielded. Otherwise, the
 * comment is left alone and nothing is emitted.
 */
function* stripAnnotations(
    els: Iterable<[ HTMLElement, HTMLElement | undefined /* parent */ ]>,
    typesToKeep: Set<PrerenderType> = new Set(),
): Iterable<PrerenderAnnotation> {
    for (const [ el, parent ] of els) {
        const annotation = parseAnnotation(el.rawText);
        if (!parent) throw new Error('Found annotation with no parent element.');
        if (!typesToKeep.has(annotation.type)) parent.removeChild(el);
        yield annotation;
    }
}

/**
 * Filters the given {@link Iterable} of {@link Node} to limit to only comment
 * nodes.
 */
function* walkTemplates(
    nodes: Iterable<[ HTMLElement, HTMLElement | undefined /* parent */ ]>,
): Iterable<[ HTMLElement, HTMLElement | undefined /* parent */ ]> {
    for (const [ el, parent ] of nodes) {
        if (el.tagName !== 'template') continue;
        if (el.getAttribute('label') !== 'bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE') continue;
        yield [ el, parent ];
    }
}

/**
 * Returns an {@link Iterable} of all the {@link Node} descendants of the given
 * root and their parent.
 */
function* walk(root: Node, parent?: HTMLElement):
        Iterable<[ HTMLElement, HTMLElement | undefined /* parent */ ]> {
    if (root instanceof HTMLElement) {
        yield [ root, parent ];
        for (const node of root.childNodes) {
            yield* walk(node, root);
        }
    }
}
