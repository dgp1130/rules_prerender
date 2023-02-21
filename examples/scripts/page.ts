import { PrerenderResource, includeScript } from 'rules_prerender';
import { renderComponent } from './component/component';

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
                ${includeScript('examples/scripts/script')}
                ${renderComponent()}
            </body>
        </html>
    `);

    yield PrerenderResource.of('/nested/other.html', `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Scripts</title>
            </head>
            <body>
                <h2>Scripts</h2>
                <div id="other-replace">
                    This text to be overwritten by client-side JavaScript.
                </div>
                ${includeScript('examples/scripts/other')}
                ${renderComponent()}
            </body>
        </html>
    `);
}
