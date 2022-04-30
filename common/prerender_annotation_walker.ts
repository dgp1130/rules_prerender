import { CommentNode, HTMLElement, Node } from 'node-html-parser';
import { parseAnnotation, PrerenderAnnotation } from 'rules_prerender/common/models/prerender_annotation';

/**
 * A reference to a `node-html-parser` `Node` which contains a
 * {@link PrerenderAnnotation} and can be updated (removed from / replaced in the tree).
 */
export class AnnotationNode {
    /** The annotation this node contains. */
    public annotation: PrerenderAnnotation;

    private updateableNode: UpdateableNode<CommentNode>;

    private constructor({ annotation, updateableNode }: {
        annotation: PrerenderAnnotation,
        updateableNode: UpdateableNode<CommentNode>,
    }) {
        this.annotation = annotation;
        this.updateableNode = updateableNode;
    }

    /** Returns an `AnnotationNode` for the given annotation and its node. */
    public static from(
        annotation: PrerenderAnnotation,
        updateableNode: UpdateableNode<CommentNode>,
    ): AnnotationNode {
        return new AnnotationNode({ annotation, updateableNode });
    }

    /**
     * Removes this annotation's node from the tree.
     * @throws if the annotation's node has already been updated.
     */
    public remove(): void {
        this.updateableNode.remove();
    }

    /**
     * Replaces this annotation's node in the DOM tree with the given node.
     * @throws if the node has already been updated.
     */
    public replace(replacement: Node): void {
        this.updateableNode.replace(replacement);
    }
}

/**
 * A reference to a `node-html-parser` `Node` which can be updated (removed / replaced).
 * This is useful a `Node` cannot normally be removed or replaced without also knowing
 * its parent, which can be annoying to track.
 */
class UpdateableNode<T extends Node> {
    /** The `node-html-parser` `Node` this references. */
    public node: T;

    private parent: HTMLElement;
    private updated = false;

    private constructor({ node, parent }: { node: T, parent: HTMLElement }) {
        this.node = node;
        this.parent = parent;
    }

    /** Returns an `UpdateableNode` for the given node and its parent. */
    public static from<T extends Node>(
        { node, parent }: { node: T, parent: HTMLElement },
    ): UpdateableNode<T> {
        return new UpdateableNode({ node, parent });
    }

    /**
     * Removes this node from the tree.
     * @throws if the node has already been updated.
     */
    public remove(): void {
        if (this.updated) throw new Error(`Node was already updated, cannot remove it.`);
        this.updated = true;

        this.parent.removeChild(this.node);
    }

    /**
     * Replaces this node in the DOM tree with the given node.
     * @throws if the node has already been updated.
     */
    public replace(replacement: Node): void {
        if (this.updated) throw new Error(`Node was already updated, cannot replace it.`);
        this.updated = true;

        this.parent.exchangeChild(this.node, replacement);
    }
}

/** Returns a {@link Generator} of all annotations in the tree. */
export function walkAllAnnotations(root: HTMLElement):
        Generator<AnnotationNode, void, void> {
    return walkAnnotations(walkComments(walk(root)));
}

/**
 * Parses the given {@link Generator} of {@link CommentNode}s, filtering out any which
 * aren't annotations and returning a new {@link Generator} of {@link AnnotationNode}.
 */
function* walkAnnotations(
    nodes: Generator<UpdateableNode<CommentNode>, void, void>,
): Generator<AnnotationNode, void, void> {
    for (const updateableNode of nodes) {
        const annotation = parseAnnotation(updateableNode.node.text);
        if (!annotation) continue;

        yield AnnotationNode.from(annotation, updateableNode);
    }
}

/**
 * Filters the given {@link Generator} of {@link Node}s to limit to only
 * {@link CommentNode}s.
 */
function* walkComments(nodes: Generator<UpdateableNode<Node>, void, void>):
        Generator<UpdateableNode<CommentNode>> {
    for (const updateableNode of nodes) {
        if (updateableNode.node instanceof CommentNode) {
            yield updateableNode;
        }
    }
}

/**
 * Returns a {@link Generator} of {@link UpdateableNode}s for each descendant of the
 * given root and their parent. The root node without a parent is dropped.
 */
function* walk(node: Node, parent?: HTMLElement):
        Generator<UpdateableNode<Node>, void, void> {
    if (parent) yield UpdateableNode.from({ node, parent });

    if (node instanceof HTMLElement) {
        for (const child of node.childNodes) {
            yield* walk(child, node);
        }
    }
}