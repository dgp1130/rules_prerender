import { PrerenderResource, includeScript } from 'rules_prerender';
import { renderComponent } from 'rules_prerender/examples/scripts/component/component';

/** Render some HTML with a `<script />` tag. */
export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', `
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
                ${includeScript('rules_prerender/examples/scripts/script')}
                ${renderComponent()}
            </body>
        </html>
    `);
}
