import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.fromHtml('/index.html', renderToHtml(
        <html>
            <head>
                <meta charSet="utf8" />
                <title>No scripts</title>
            </head>
            <body>
                <h2>No scripts</h2>
            </body>
        </html>
    ));
}
