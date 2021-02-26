import * as htmlLib from 'node-html-parser';
import { PrerenderAnnotation, parseAnnotation } from '../../common/models/prerender_annotation.js';

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
    string /* strippedHtml */,
    Array<PrerenderAnnotation> /* annotations */,
] {
    const root = htmlLib.parse(html, {
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
    const annotations = Array.from(stripAnnotations(walkComments(walk(root))));

    return [ root.toString(), annotations ];
}

/**
 * Checks each given comment to see if it is an annotation. If so, the comment
 * is removed from the document and the annotation is yielded. Otherwise, the
 * comment is left alone and nothing is emitted.
 */
function* stripAnnotations(
    comments: Iterable<[ htmlLib.CommentNode, htmlLib.HTMLElement | undefined /* parent */ ]>,
): Iterable<PrerenderAnnotation> {
    for (const [ comment, parent ] of comments) {
        const annotation = parseAnnotation(comment.text);
        if (!annotation) continue;
        if (!parent) throw new Error('Found comment node with no parent.');
        parent.removeChild(comment);
        yield annotation;
    }
}

/**
 * Filters the given {@link Iterable} of {@link Node} to limit to only comment
 * nodes.
 */
function* walkComments(
    nodes: Iterable<[ htmlLib.Node, htmlLib.HTMLElement | undefined /* parent */ ]>,
): Iterable<[ htmlLib.CommentNode, htmlLib.HTMLElement | undefined /* parent */ ]> {
    for (const [ node, parent ] of nodes) {
        if (node instanceof htmlLib.CommentNode) {
            yield [ node, parent ];
        }
    }
}

/**
 * Returns an {@link Iterable} of all the {@link Node} descendants of the given
 * root and their parent.
 */
function* walk(root: htmlLib.Node, parent?: htmlLib.HTMLElement):
        Iterable<[ htmlLib.Node, htmlLib.HTMLElement | undefined /* parent */ ]> {
    yield [ root, parent ];
    if (root instanceof htmlLib.HTMLElement) {
        for (const node of root.childNodes) {
            yield* walk(node, root);
        }
    }
}
