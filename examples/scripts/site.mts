import { PrerenderResource, html, includeScript, renderToHtml } from '@rules_prerender/lit_engine';
import { renderComponent } from './component/component.mjs';

/** Render some HTML with a `<script />` tag. */
export default async function*(): AsyncGenerator<PrerenderResource, void, void> {
    yield PrerenderResource.fromHtml('/index.html', await renderToHtml(html`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Scripts</title>
            </head>
            <body>
                <h2>Scripts</h2>
                <div id="replace">
                    This text to be overwritten by client-side JavaScript.
                </div>
                ${includeScript('./script.mjs', import.meta)}
                ${renderComponent()}
            </body>
        </html>
    `));
}
