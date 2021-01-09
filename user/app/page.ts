import { PrerenderResource, includeScript, includeStyle } from 'rules_prerender';
import { renderComponent } from 'user/app/component/component';

export default function*(): Iterable<PrerenderResource> {
    yield PrerenderResource.of('/index.html', `
        <!DOCTYPE html>
        <html>
            <head>
                <title>User repo</title>
                <meta charset="utf-8">
                ${includeScript('user/app/page_scripts')}
                ${includeStyle('user/app/page_styles.css')}
            </head>
            <body>
                <h2>User repo</h2>
                ${renderComponent('World')}
            </body>
        </html>
    `);
}
