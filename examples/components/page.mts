import { PrerenderResource } from 'rules_prerender';
import { render as renderComponent } from './component.mjs';

/** Renders a page using components. */
export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Components</title>
            </head>
            <body>
                <h2>Components</h2>
                ${renderComponent()}
            </body>
        </html>
    `);
}
