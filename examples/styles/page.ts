import { PrerenderResource, inlineStyle } from 'rules_prerender';
import { renderComponent } from 'rules_prerender/examples/styles/component/component';

/** Render an HTML page. */
export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Styling</title>
            </head>
            <body>
                <h2>Styling</h2>
                <div class="page">
                    <template shadowroot="open">
                        <div class="label">I'm a page with some CSS!</div>
                        <slot></slot>
                        ${inlineStyle('rules_prerender/examples/styles/page.css')}
                    </template>
                    ${renderComponent()}
                </div>
            </body>
        </html>
    `);
}
