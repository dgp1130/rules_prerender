import 'jasmine';

import { createAnnotation } from '@rules_prerender/annotations';
import { includeScript } from './scripts';

describe('scripts', () => {
    describe('includeScript()', () => {
        it('creates an annotation to include the given script', () => {
            const annotation = includeScript('./foo/bar/baz.js');

            expect(annotation).toBe(`<!-- ${createAnnotation({
                type: 'script',
                path: './foo/bar/baz.js',
            })} -->`);
        });
    });
});
