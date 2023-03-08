import { html, renderToHtml } from './index.mjs';

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
});
