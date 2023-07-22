import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';
import { Component } from './component/component.prerender.js';

export default function* (): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.fromHtml('/index.html', renderToHtml(
        <html>
            <head>
                <title>Rewrite</title>
                <meta charSet='utf8' />
            </head>
            <body>
                <h2>Rewrite</h2>

                <Component name='World' />
            </body>
        </html>
    ));
}
