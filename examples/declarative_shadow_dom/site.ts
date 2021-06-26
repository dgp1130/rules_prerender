import { PrerenderResource } from 'rules_prerender';
import { renderComponent } from 'rules_prerender/examples/declarative_shadow_dom/component';

export default async function*(): AsyncGenerator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Declarative Shadow DOM</title>
            </head>
            <body>
                ${await renderComponent(`
                    <div>Light content</div>
                `)}
            </body>
        </html>
    `);
}
