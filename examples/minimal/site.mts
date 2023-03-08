import { bar, foo } from './dep.mjs';
import { PrerenderResource, unsafeTreatStringAsSafeHtml } from 'rules_prerender';

/** Renders the page. */
export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', unsafeTreatStringAsSafeHtml(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Minimal</title>
            </head>
            <body>
                <h2 id="hello">Hello, World!</h2>
                <span id="foo">${foo}</span>
                <span id="bar">${bar}</span>
            </body>
        </html>
    `.trim()));
}
