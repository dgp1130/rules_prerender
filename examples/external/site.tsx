import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';
import { Component } from './component/component.js';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.fromHtml('/index.html', renderToHtml(
        <html>
            <head>
                <title>Test</title>
                <meta charSet="utf8" />
            </head>
            <body>
                <h2>Hello, World!</h2>

                <Component />
            </body>
        </html>
    ));
}
