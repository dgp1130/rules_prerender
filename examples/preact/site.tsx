import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';
import { Component } from './component/component.js';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', renderToHtml(
        <html>
            <head>
                <title>Preact</title>
                <meta charSet="utf8" />
            </head>
            <body>
                <Component text="Hello, World!">
                    <h2>Goodbye, World!</h2>
                </Component>
            </body>
        </html>
    ));
}
