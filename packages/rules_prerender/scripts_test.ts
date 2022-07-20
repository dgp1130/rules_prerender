import { createAnnotation } from '../../common/models/prerender_annotation';
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
