import { PrerenderResource, includeScript, inlineStyle } from 'rules_prerender';
import { renderComponent } from './component/component';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', `
        <!DOCTYPE html>
        <html>
            <head>
                <title>User repo</title>
                <meta charset="utf-8">
                ${includeScript('user/app/page_scripts')}
                ${inlineStyle('user/app/page_styles.css')}
            </head>
            <body>
                <h2>User repo</h2>
                ${renderComponent('World')}
                <span>Outside shadow DOM</span>
            </body>
        </html>
    `);
}
