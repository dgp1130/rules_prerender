import { PrerenderResource, inlineStyle } from 'rules_prerender';
import { renderComponent } from 'rules_prerender/examples/styles/component/component';

/** Render an HTML page. */
export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Styling</title>
                ${inlineStyle('rules_prerender/examples/styles/page.css')}
            </head>
            <body>
                <h2>Styling</h2>
                <div class="page">
                    <div class="label">I'm a page with some CSS!</div>
                    ${renderComponent()}
                </div>
            </body>
        </html>
    `);
}
