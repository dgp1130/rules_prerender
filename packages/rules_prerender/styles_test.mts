import * as inlineStyleMap from './inline_style_map.mjs';
import { createAnnotation } from '../../common/models/prerender_annotation.mjs';
import { inlineStyle, InlineStyleNotFoundError } from './styles.mjs';

describe('styles', () => {
    describe('inlineStyle()', () => {
        beforeEach(() => {
            inlineStyleMap.resetMapForTesting();
        });

        it('returns an inline style annotation in an HTML comment', () => {
            inlineStyleMap.setMap(new Map(Object.entries({
                'wksp/foo/bar/baz.css': 'wksp/some/real/file.css',
            })));

            const annotation = inlineStyle('wksp/foo/bar/baz.css');

            expect(annotation).toBe(`<!-- ${createAnnotation({
                type: 'style',
                path: 'wksp/some/real/file.css',
            })} -->`);
        });

        it('throws an error when the requested style import is not present', () => {
            const map = new Map(Object.entries({
                'wksp/foo/bar/baz.css': 'wksp/some/dir/baz.css',
                'wksp/hello/world.css': 'wksp/goodbye/mars.css',
            }));

            inlineStyleMap.setMap(map);

            expect(() => inlineStyle('wksp/does/not/exist.css'))
                .toThrow(InlineStyleNotFoundError.from(
                    'wksp/does/not/exist.css', map));
        });

        it('ignores the inline style map when not defined', () => {
            expect(inlineStyle('wksp/foo/bar/baz.css')).toBe(`<!-- ${createAnnotation({
                type: 'style',
                path: 'wksp/foo/bar/baz.css',
            })} -->`);
        });
    });
});
