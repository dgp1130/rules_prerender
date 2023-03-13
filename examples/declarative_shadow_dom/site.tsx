import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';
import { Component } from './component.js';

export default async function*(): AsyncGenerator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', renderToHtml(
        <html>
            <head>
                <title>Declarative Shadow DOM</title>
            </head>
            <body>
                <Component>
                    <div>Light content</div>
                </Component>
            </body>
        </html>
    ));
}
