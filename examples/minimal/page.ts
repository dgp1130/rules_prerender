import { bar, foo } from './dep';
import { PrerenderResource } from 'rules_prerender';

/** Renders the page. */
export default function*(): Iterable<PrerenderResource> {
    yield PrerenderResource.of('/index.html', `
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
    `.trim());
}
