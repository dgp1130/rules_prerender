import { bar, foo } from './dep.mjs';
import { html, renderToHtml } from '@rules_prerender/lit_engine';
import { PrerenderResource } from 'rules_prerender';

/** Renders the page. */
export default async function*(): AsyncGenerator<PrerenderResource, void, void> {
    yield PrerenderResource.fromHtml('/index.html', await renderToHtml(html`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Minimal</title>
                <meta charSet='utf8' />
            </head>
            <body>
                <h2 id="hello">Hello, World!</h2>
                <span id="foo">${foo}</span>
                <span id="bar">${bar}</span>
            </body>
        </html>
    `));
}
