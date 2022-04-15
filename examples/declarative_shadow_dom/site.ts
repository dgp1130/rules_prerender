import { PrerenderResource } from 'rules_prerender';
import { renderComponent } from 'rules_prerender/examples/declarative_shadow_dom/component';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Declarative Shadow DOM</title>
            </head>
            <body>
                ${renderComponent(`
                    <div>Light content</div>
                `)}
            </body>
        </html>
    `);
}
