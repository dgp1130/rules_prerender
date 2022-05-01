import 'jasmine';

import * as inlineStyleMap from 'rules_prerender/packages/rules_prerender/inline_style_map';
import { createAnnotation, StyleScope } from 'rules_prerender/common/models/prerender_annotation';
import { includeStyle, inlineStyle, inlineStyleLegacy } from 'rules_prerender/packages/rules_prerender/styles';

describe('styles', () => {
    describe('includeStyle()', () => {
        it('returns a global style annotation in an HTML comment', () => {
            const annotation = includeStyle('wksp/foo/bar/baz.css');

            expect(annotation).toBe(`<!-- ${createAnnotation({
                type: 'style',
                scope: StyleScope.Global,
                path: 'wksp/foo/bar/baz.css',
            })} -->`);
        });
    });

    describe('inlineStyle()', () => {
        it('returns an inline style annotation in an HTML comment', () => {
            spyOn(inlineStyleMap, 'getMap').and.returnValue(new Map(Object.entries({
                'wksp/foo/bar/baz.css': 'wksp/some/real/file.css',
            })));

            const annotation = inlineStyle('wksp/foo/bar/baz.css');

            expect(annotation).toBe(`<!-- ${createAnnotation({
                type: 'style',
                scope: StyleScope.Inline,
                path: 'wksp/some/real/file.css',
            })} -->`);
        });

        it('throws an error when the requested style import is not present', () => {
            spyOn(inlineStyleMap, 'getMap').and.returnValue(new Map(Object.entries({
                'wksp/foo/bar/baz.css': 'wksp/some/dir/baz.css',
                'wksp/hello/world.css': 'wksp/goodbye/mars.css',
            })));

            expect(() => inlineStyle('wksp/does/not/exist.css')).toThrowError(`
Could not find "wksp/does/not/exist.css" in the inline style map. Available imports are:

wksp/foo/bar/baz.css
wksp/hello/world.css
            `.trim());
        });

        it('ignores the inline style map when not defined', () => {
            spyOn(inlineStyleMap, 'getMap').and.returnValue(undefined);

            expect(inlineStyle('wksp/foo/bar/baz.css')).toBe(`<!-- ${createAnnotation({
                type: 'style',
                scope: StyleScope.Inline,
                path: 'wksp/foo/bar/baz.css',
            })} -->`);
        });
    });

    describe('inlineStyleLegacy()', () => {
        it('resolves to a `<style />` element with the runfiles content of the given file path', async () => {
            const styles = await inlineStyleLegacy(
                'rules_prerender/packages/rules_prerender/testdata/styles.css');
            expect(styles).toBe(`
<style>
.foo { color: red; }

</style>
            `.trim());
        });

        it('rejects when the given file path is not found in runfiles', async () => {
            await expectAsync(inlineStyleLegacy('rules_prerender/does/not/exist.css'))
                .toBeRejected();
        });
    });
});
