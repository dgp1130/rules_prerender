import { bar, foo } from './dep.mjs';
import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';

/** Renders the page. */
export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', renderToHtml(
        <html>
            <head>
                <title>Minimal</title>
                <meta charSet='utf8' />
            </head>
            <body>
                <h2 id="hello">Hello, World!</h2>
                <span id="foo">{foo}</span>
                <span id="bar">{bar}</span>
            </body>
        </html>
    ));
}
