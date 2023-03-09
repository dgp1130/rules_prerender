import { PrerenderResource, inlineStyle, includeScript } from 'rules_prerender';
import { renderComponent } from './component/component.mjs';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Testonly</title>

                ${inlineStyle('./site_styles.css', import.meta)}
            </head>
            <body>
                <h2>Testonly</h2>

                <div class="site">
                    <span class="hello">Hello from a testonly page!</span>
                    <img src="/images/site.png" />
                    ${renderComponent()}
                    ${includeScript('./site_script.mjs', import.meta)}
                </div>
            </body>
        </html>
    `);
}
