import { PrerenderResource } from 'rules_prerender';
import { render as renderComponent } from './component';

/** Renders a page using components. */
export default function*(): Iterable<PrerenderResource> {
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
