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
        <rules_prerender:annotation>${annotation1}</rules_prerender:annotation>
        <rules_prerender:annotation>${annotation2}</rules_prerender:annotation>
        <rules_prerender:annotation>${annotation3}</rules_prerender:annotation>
    </body>
</html>
            `.trim());

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
        <rules_prerender:annotation>${annotation}</rules_prerender:annotation>
    </body>
</html>
            `.trim());

            const annotationEls = Array.from(walkAllAnnotations(root));
            expect(annotationEls.length).toBe(1);
            const { el } = annotationEls[0]!;
            el.remove();

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
        <rules_prerender:annotation>${annotation}</rules_prerender:annotation>
    </body>
</html>
            `.trim());

            const annotationEls = Array.from(walkAllAnnotations(root));
            expect(annotationEls.length).toBe(1);
            const { el } = annotationEls[0]!;
            el.replaceWith(new HTMLElement(
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

        it('throws an error when given an invalid annotation', () => {
            const root = parse(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test Page</title>
    </head>
    <body>
        <rules_prerender:annotation>not an annotation</rules_prerender:annotation>
    </body>
</html>
            `.trim());

            expect(() => Array.from(walkAllAnnotations(root)))
                .toThrowError(/Failed to parse annotation/);
        });
    });
});
