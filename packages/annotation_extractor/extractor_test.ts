import 'jasmine';

import { extract } from 'rules_prerender/packages/annotation_extractor/extractor';
import { createAnnotation, StyleScope } from 'rules_prerender/common/models/prerender_annotation';

describe('extractor', () => {
    describe('extract()', () => {
        it('extracts annotations from the given HTML contents', () => {
            const annotation = createAnnotation({ type: 'script', path: 'wksp/foo.js' });
            const [ extracted, annotations ] = extract(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Title</title>
                        <!-- ${annotation} -->
                    </head>
                    <body>
                        <h2>Hello, World!</h2>
                    </body>
                </html>
            `);

            expect(extracted).toBe(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Title</title>
                        
                    </head>
                    <body>
                        <h2>Hello, World!</h2>
                    </body>
                </html>
            `);
            expect(Array.from(annotations.values())).toEqual([
                {
                    type: 'script',
                    path: 'wksp/foo.js',
                },
            ]);
        });

        it('extracts a first node annotation', () => {
            const annotation = createAnnotation({ type: 'script', path: 'wksp/foo.js' });
            const [ extracted, annotations ] = extract(`<!-- ${annotation} -->
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Title</title>
                    </head>
                    <body></body>
                </html>
            `);

            expect(extracted).toBe(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Title</title>
                    </head>
                    <body></body>
                </html>
            `);
            expect(Array.from(annotations.values())).toEqual([
                {
                    type: 'script',
                    path: 'wksp/foo.js',
                },
            ]);
        });

        it('ignores unrelated comments', () => {
            const annotation = createAnnotation({ type: 'script', path: 'wksp/foo.js' });
            const [ extracted, annotations ] = extract(`
                <!-- Some leading comment. -->
                <!DOCTYPE html>
                <html>
                    <head>
                        <!-- Another comment -->
                        <title>Title</title>
                    </head>
                    <!-- One more comment. -->
                    <body>
                        <!-- ${annotation} -->
                    </body>
                </html>
            `);

            expect(extracted).toBe(`
                <!-- Some leading comment. -->
                <!DOCTYPE html>
                <html>
                    <head>
                        <!-- Another comment -->
                        <title>Title</title>
                    </head>
                    <!-- One more comment. -->
                    <body>
                        
                    </body>
                </html>
            `);
            expect(Array.from(annotations.values())).toEqual([
                {
                    type: 'script',
                    path: 'wksp/foo.js',
                },
            ]);
        });

        it('ignores styles', () => {
            const annotation = createAnnotation({
                type: 'style',
                path: 'wksp/foo.css',
                scope: StyleScope.Inline,
            });

            const [ extracted, annotations ] = extract(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Title</title>
                    </head>
                    <body>
                        <!-- ${annotation} -->
                    </body>
                </html>
            `);

            expect(extracted).toBe(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Title</title>
                    </head>
                    <body>
                        <!-- ${annotation} -->
                    </body>
                </html>
            `);
            expect(Array.from(annotations.values())).toEqual([]);
        });
    });
});
