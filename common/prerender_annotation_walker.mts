import { HTMLElement } from 'node-html-parser';
import { parseAnnotation, PrerenderAnnotation } from './models/prerender_annotation.mjs';

/**
 * A reference to a `node-html-parser` `Node` which contains a
 * {@link PrerenderAnnotation} and can be updated (removed from / replaced in the tree).
 */
export interface AnnotationEl {
    /** The annotation this node contains. */
    annotation: PrerenderAnnotation;

    /** The element containing the annotation. */
    el: HTMLElement;
}

/** Returns a {@link Generator} of all annotations in the tree. */
export function walkAllAnnotations(root: HTMLElement):
        Generator<AnnotationEl, void, void> {
    return walkAnnotations(walk(root));
}

/**
 * Parses the given {@link Generator} of {@link HTMLElement}s, filtering
 * out any which aren't annotations and returning a new {@link Generator} of
 * {@link AnnotationEl}.
 */
function* walkAnnotations(els: Generator<HTMLElement, void, void>):
        Generator<AnnotationEl, void, void> {
    for (const el of els) {
        // Root element has a `null` `tagName`.
        if (el.tagName?.toLowerCase() !== 'rules_prerender:annotation') continue;

        // Parse the annotation.
        const annotation = parseAnnotation(el.textContent);
        if (!annotation) throw new Error(`Failed to parse annotation:\n${el.outerHTML}`);

        yield { annotation, el };
    }
}

/**
 * Returns a {@link Generator} of {@link UpdateableElement}s for each descendant
 * of the given root and their parent. The root node without a parent is
 * dropped.
 */
function* walk(el: HTMLElement): Generator<HTMLElement, void, void> {
    yield el;

    for (const child of el.childNodes) {
        // Ignore `Nodes`, all annotations are `HTMLElements`.
        if (child instanceof HTMLElement) {
            yield* walk(child);
        }
    }
}
