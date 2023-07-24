import { PrerenderResource, renderToHtml, includeScript } from '@rules_prerender/preact';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.fromHtml('/index.html', renderToHtml(
        <html>
            <head>
                <meta charSet="utf8" />
                <title>Empty script</title>
            </head>
            <body>
                <h2>Empty script</h2>

                {includeScript('./empty_script.mjs', import.meta)}
            </body>
        </html>
    ));
}
