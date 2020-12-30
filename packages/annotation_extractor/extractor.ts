import { parse, HTMLElement, Node, CommentNode } from 'node-html-parser';
import { PrerenderAnnotation, parseAnnotation } from 'rules_prerender/common/models/prerender_annotation';
import * as assert from 'assert';

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
    Set<PrerenderAnnotation> /* annotations */,
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
    const annotations = unique(stripAnnotations(walkComments(walk(root))));

    return [ root.toString(), annotations ];
}

/**
 * Checks each given comment to see if it is an annotation. If so, the comment
 * is removed from the document and the annotation is yielded. Otherwise, the
 * comment is left alone and nothing is emitted.
 */
function* stripAnnotations(
    comments: Iterable<[ CommentNode, HTMLElement | undefined /* parent */ ]>,
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
    nodes: Iterable<[ Node, HTMLElement | undefined /* parent */ ]>,
): Iterable<[ CommentNode, HTMLElement | undefined /* parent */ ]> {
    for (const [ node, parent ] of nodes) {
        if (node instanceof CommentNode) {
            yield [ node, parent ];
        }
    }
}

/**
 * Returns an {@link Iterable} of all the {@link Node} descendants of the given
 * root and their parent.
 */
function* walk(root: Node, parent?: HTMLElement):
        Iterable<[ Node, HTMLElement | undefined /* parent */ ]> {
    yield [ root, parent ];
    if (root instanceof HTMLElement) {
        for (const node of root.childNodes) {
            yield* walk(node, root);
        }
    }
}

/**
 * Returns a {@link Set} of the unique items of the given iterable, performing a
 * deep equality comparison on the items to determine uniqueness.
 */
function unique<T extends object>(items: Iterable<T>): Set<T> {
    const set = new Set<T>();
    for (const item of items) {
        const exists = Array.from(set.values())
                .some((existing) => deepEqual(item, existing));
        if (!exists) set.add(item);
    }
    return set;
}

/**
 * Returns whether or not the two objects as deeply equivalent to each other.
 */
function deepEqual(first: object, second: object): boolean {
    try {
        assert.deepStrictEqual(first, second);
        return true;
    } catch (err) {
        return false;
    }
}
