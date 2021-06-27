import 'jasmine';

import { includeStyle, inlineStyle } from 'rules_prerender/packages/rules_prerender/styles';

describe('styles', () => {
    describe('includeStyle()', () => {
        it('returns a style annotation in an HTML comment', () => {
            const annotation = includeStyle('foo/bar/baz.css');

            expect(annotation).toBe(
                '<!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"style","path":"foo/bar/baz.css"} -->');
        });
    });

    describe('inlineStyle()', () => {
        it('resolves to a `<style />` element with the runfiles content of the given file path', async () => {
            const styles = await inlineStyle(
                'rules_prerender/packages/rules_prerender/testdata/styles.css');
            expect(styles).toBe(`
<style>
.foo { color: red; }

</style>
            `.trim());
        });

        it('rejects when the given file path is not found in runfiles', async () => {
            await expectAsync(inlineStyle('rules_prerender/does/not/exist.css'))
                .toBeRejected();
        });
    });
});
