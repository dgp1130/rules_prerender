import { HTMLElement, parse } from 'node-html-parser';
import { createAnnotation } from './models/prerender_annotation.mjs';
import { walkAllAnnotations } from './prerender_annotation_walker.mjs';

describe('prerender_annotation_walker', () => {
    describe('walkAllAnnotations()', () => {
        it('walks all annotations', () => {
            const annotation1 = createAnnotation({ type: 'script', path: 'wksp/foo.js' });
            const annotation2 = createAnnotation({ type: 'script', path: 'wksp/bar.js' });
            const annotation3 = createAnnotation({ type: 'script', path: 'wksp/baz.js' });

            const root = parse(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test Page</title>
    </head>
    <body>
        <!-- ${annotation1} -->
        <!-- ${annotation2} -->
        <!-- ${annotation3} -->
    </body>
</html>
            `.trim(), { comment: true });

            const annotations = Array.from(walkAllAnnotations(root))
                .map((node) => node.annotation);
            expect(annotations).toEqual([
                { type: 'script', path: 'wksp/foo.js' },
                { type: 'script', path: 'wksp/bar.js' },
                { type: 'script', path: 'wksp/baz.js' },
            ]);
        });

        it('can remove nodes from the tree', () => {
            const annotation = createAnnotation({ type: 'script', path: 'wksp/foo.js' });

            const root = parse(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test Page</title>
    </head>
    <body>
        <!-- ${annotation} -->
    </body>
</html>
            `.trim(), { comment: true });

            const nodes = Array.from(walkAllAnnotations(root));
            expect(nodes.length).toBe(1);
            const node = nodes[0]!;
            node.remove();

            const extracted = root.toString();
            expect(extracted).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test Page</title>
    </head>
    <body>
        
    </body>
</html>
            `.trim());
        });

        it('can replace nodes in the tree', () => {
            const annotation = createAnnotation({ type: 'script', path: 'wksp/foo.js' });

            const root = parse(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test Page</title>
    </head>
    <body>
        <!-- ${annotation} -->
    </body>
</html>
            `.trim(), { comment: true });

            const nodes = Array.from(walkAllAnnotations(root));
            expect(nodes.length).toBe(1);
            const node = nodes[0]!;
            node.replace(new HTMLElement(
                'script' /* tagName */,
                {} /* keyAttrs */,
                '' /* rawAttrs */,
                null /* parentNode */,
                [0, 0] /* range */,
            ));

            const extracted = root.toString();
            expect(extracted).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test Page</title>
    </head>
    <body>
        <script></script>
    </body>
</html>
            `.trim());
        });

        it('throws an error when a node is removed after being updated', () => {
            const annotation = createAnnotation({ type: 'script', path: 'wksp/foo.js' });

            const root = parse(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test Page</title>
    </head>
    <body>
        <!-- ${annotation} -->
    </body>
</html>
            `.trim(), { comment: true });

            const nodes = Array.from(walkAllAnnotations(root));
            expect(nodes.length).toBe(1);
            const node = nodes[0]!;
            node.remove(); // Update the node.

            // Try to update it again.
            expect(() => node.remove())
                .toThrowError('Node was already updated, cannot remove it.');
        });

        it('throws an error when a node is replaced after being updated', () => {
            const annotation = createAnnotation({ type: 'script', path: 'wksp/foo.js' });

            const root = parse(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test Page</title>
    </head>
    <body>
        <!-- ${annotation} -->
    </body>
</html>
            `.trim(), { comment: true });

            const nodes = Array.from(walkAllAnnotations(root));
            expect(nodes.length).toBe(1);
            const node = nodes[0]!;
            node.remove(); // Update the node.

            // Try to update it again.
            expect(() => node.replace(new HTMLElement(
                'script' /* tagName */,
                {} /* keyAttrs */,
                '' /* rawAttrs */,
                null /* parentNode */,
                [0, 0] /* range */,
            ))).toThrowError('Node was already updated, cannot replace it.');
        });
    });
});
