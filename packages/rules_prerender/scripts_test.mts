import { createAnnotation } from '../../common/models/prerender_annotation.mjs';
import { includeScript } from './scripts.mjs';

describe('scripts', () => {
    describe('includeScript()', () => {
        it('creates an annotation to include the given script', () => {
            const annotation = includeScript('foo/bar/baz.mjs');

            expect(annotation).toBe(`<!-- ${createAnnotation({
                type: 'script',
                path: 'foo/bar/baz.mjs',
            })} -->`);
        });
    });
});
