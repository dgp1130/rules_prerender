import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';
import { Component } from './component.js';

/** Renders a page using components. */
export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', renderToHtml(
        <html>
            <head>
                <title>Components</title>
                <meta charSet='utf8' />
            </head>
            <body>
                <h2>Components</h2>
                <Component />
            </body>
        </html>
    ));
}
