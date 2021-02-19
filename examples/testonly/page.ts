import { PrerenderResource, includeStyle, includeScript } from 'rules_prerender';
import { renderComponent } from 'rules_prerender/examples/testonly/component/component';

export default function*(): Iterable<PrerenderResource> {
    yield PrerenderResource.of('/index.html', `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Testonly</title>
            </head>
            <body>
                <h2>Testonly</h2>

                <div class="page">
                    <span class="hello">Hello from a testonly page!</span>
                    <img src="/images/page.png" />
                    ${renderComponent()}
                    ${includeScript('rules_prerender/examples/testonly/page_script')}
                    ${includeStyle('rules_prerender/examples/testonly/page_styles.css')}
                </div>
            </body>
        </html>
    `);
}
