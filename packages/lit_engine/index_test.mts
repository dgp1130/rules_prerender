import { createAnnotation } from '../../common/models/prerender_annotation.mjs';
import { html, includeScript, inlineStyle, renderToHtml } from './index.mjs';

describe('@rules_prerender/lit_engine', () => {
    describe('renderToHtml()', () => {
        it('renders to `SafeHtml`', async () => {
            const content = await renderToHtml(html`<div>Hello, World!</div>`);

            expect(content.getHtmlAsString())
                .toContain(`<div>Hello, World!</div>`);
        });

        it('escapes unsafe content', async () => {
            const interpolation = '<script>alert("Hacked!");</script>';
            const content =
                await renderToHtml(html`<div>${interpolation}</div>`);

            expect(content.getHtmlAsString())
                .not.toContain('<script>alert("Hacked!");</script>');
            expect(content.getHtmlAsString()).toContain(
                '&lt;script&gt;alert(&quot;Hacked!&quot;);&lt;/script&gt;');
        });
    });

    describe('includeScript()', () => {
        it('returns an unescaped annotation', async () => {
            const meta = {
                url: 'file:///.../execroot/wksp/bazel-out/k8-fastbuild/bin/path/to/pkg/foo.mjs',
            };

            const annotation =
                await renderToHtml(includeScript('./bar.mjs', meta));
            expect(annotation.getHtmlAsString()).toContain(createAnnotation({
                type: 'script',
                path: 'path/to/pkg/bar.mjs',
            }));
        });
    });

    describe('inlineStyle()', () => {
        it('returns an unescaped annotation', async () => {
            const meta = {
                url: 'file:///.../execroot/wksp/bazel-out/k8-fastbuild/bin/path/to/pkg/foo.mjs',
            };

            const annotation =
                await renderToHtml(inlineStyle('./bar.css', meta));
            expect(annotation.getHtmlAsString()).toContain(createAnnotation({
                type: 'style',
                path: 'path/to/pkg/bar.css',
            }));
        });
    });
});
