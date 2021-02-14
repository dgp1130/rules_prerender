import 'jasmine';

import { extract } from 'rules_prerender/packages/annotation_extractor/extractor';

describe('extractor', () => {
    describe('extract()', () => {
        it('extracts annotations from the given HTML contents', () => {
            const [ extracted, annotations ] = extract(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Title</title>
                        <!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"script","path":"foo/bar/baz.js"} -->
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
                    path: 'foo/bar/baz.js',
                },
            ]);
        });

        it('extracts a first node annotation', () => {
            const [ extracted, annotations ] = extract(`<!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"script","path":"foo/bar/baz.js"} -->
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
                    path: 'foo/bar/baz.js',
                },
            ]);
        });

        it('ignores unrelated comments', () => {
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
                        <!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"script","path":"foo/bar/baz.js"} -->
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
                    path: 'foo/bar/baz.js',
                },
            ]);
        });
    });
});
