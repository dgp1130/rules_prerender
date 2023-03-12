import { extract } from './extractor.mjs';
import { serialize } from '../../../common/models/prerender_annotation.mjs';

describe('extractor', () => {
    describe('extract()', () => {
        it('extracts annotations from the given HTML contents', () => {
            const annotation = serialize({ type: 'script', path: 'wksp/foo.js' });
            const [ extracted, annotations ] = extract(`
<!DOCTYPE html>
<html>
    <head>
        <title>Title</title>
        <rules_prerender:annotation>${annotation}</rules_prerender:annotation>
    </head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
            `.trim());

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
            `.trim());
            expect(Array.from(annotations.values())).toEqual([
                {
                    type: 'script',
                    path: 'wksp/foo.js',
                },
            ]);
        });

        it('extracts a first node annotation', () => {
            const annotation = serialize({ type: 'script', path: 'wksp/foo.js' });
            const [ extracted, annotations ] = extract(`
<rules_prerender:annotation>${annotation}</rules_prerender:annotation><!DOCTYPE html>
<html>
    <head>
        <title>Title</title>
    </head>
    <body></body>
</html>
            `.trim());

            expect(extracted).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Title</title>
    </head>
    <body></body>
</html>
            `.trim());
            expect(Array.from(annotations.values())).toEqual([
                {
                    type: 'script',
                    path: 'wksp/foo.js',
                },
            ]);
        });

        it('ignores unrelated comments', () => {
            const annotation = serialize({ type: 'script', path: 'wksp/foo.js' });
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
        <rules_prerender:annotation>${annotation}</rules_prerender:annotation>
    </body>
</html>
            `.trim());

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
            `.trim());
            expect(Array.from(annotations.values())).toEqual([
                {
                    type: 'script',
                    path: 'wksp/foo.js',
                },
            ]);
        });

        it('ignores styles', () => {
            const annotation = serialize({ type: 'style', path: 'wksp/foo.css' });

            const [ extracted, annotations ] = extract(`
<!DOCTYPE html>
<html>
    <head>
        <title>Title</title>
    </head>
    <body>
        <rules_prerender:annotation>${annotation}</rules_prerender:annotation>
    </body>
</html>
            `.trim());

            expect(extracted).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Title</title>
    </head>
    <body>
        <rules_prerender:annotation>${annotation}</rules_prerender:annotation>
    </body>
</html>
            `.trim());
            expect(Array.from(annotations.values())).toEqual([]);
        });
    });
});
