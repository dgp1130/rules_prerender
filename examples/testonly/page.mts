import { PrerenderResource, inlineStyle, includeScript } from 'rules_prerender';
import { renderComponent } from './component/component.mjs';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Testonly</title>

                ${inlineStyle('rules_prerender/examples/testonly/page_styles.css')}
            </head>
            <body>
                <h2>Testonly</h2>

                <div class="page">
                    <span class="hello">Hello from a testonly page!</span>
                    <img src="/images/page.png" />
                    ${renderComponent()}
                    ${includeScript('./page_script.mjs', import.meta)}
                </div>
            </body>
        </html>
    `);
}
