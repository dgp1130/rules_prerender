import * as inlineStyleMap from './inline_style_map';
import { createAnnotation } from '../../common/models/prerender_annotation';
import { inlineStyle, InlineStyleNotFoundError } from './styles';

describe('styles', () => {
    describe('inlineStyle()', () => {
        it('returns an inline style annotation in an HTML comment', () => {
            spyOn(inlineStyleMap, 'getMap').and.returnValue(new Map(Object.entries({
                'wksp/foo/bar/baz.css': 'wksp/some/real/file.css',
            })));

            const annotation = inlineStyle('wksp/foo/bar/baz.css');

            expect(annotation).toBe(`<!-- ${createAnnotation({
                type: 'style',
                path: 'wksp/some/real/file.css',
            })} -->`);
        });

        it('throws an error when the requested style import is not present', () => {
            spyOn(inlineStyleMap, 'getMap').and.returnValue(new Map(Object.entries({
                'wksp/foo/bar/baz.css': 'wksp/some/dir/baz.css',
                'wksp/hello/world.css': 'wksp/goodbye/mars.css',
            })));

            expect(() => inlineStyle('wksp/does/not/exist.css'))
                .toThrow(InlineStyleNotFoundError.from(
                    'wksp/does/not/exist.css',
                    new Map(Object.entries({
                        'wksp/foo/bar/baz.css': 'wksp/some/dir/baz.css',
                        'wksp/hello/world.css': 'wksp/goodbye/mars.css',
                    })),
                ));
        });

        it('ignores the inline style map when not defined', () => {
            spyOn(inlineStyleMap, 'getMap').and.returnValue(undefined);

            expect(inlineStyle('wksp/foo/bar/baz.css')).toBe(`<!-- ${createAnnotation({
                type: 'style',
                path: 'wksp/foo/bar/baz.css',
            })} -->`);
        });
    });
});
