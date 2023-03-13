import { PrerenderResource, includeScript, renderToHtml } from '@rules_prerender/preact';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', renderToHtml(
        <html>
            <head>
                <title>Script Isolation</title>
                <meta charSet='utf8' />
            </head>
            <body>
                <ul>
                    <li><a href='/foo.html'>Foo</a></li>
                    <li><a href='/bar.html'>Bar</a></li>
                </ul>
            </body>
        </html>
    ));

    yield PrerenderResource.of('/foo.html', renderToHtml(
        <html>
            <head>
                <title>Script Isolation</title>
                <meta charSet="utf8" />
            </head>
            <body>
                <div id='replace-foo'>Text to be replaced.</div>
                <div id='replace-bar'>Text to be replaced.</div>
                {includeScript('./foo.mjs', import.meta)}
            </body>
        </html>
    ));

    yield PrerenderResource.of('/bar.html', renderToHtml(
        <html>
            <head>
                <title>Script Isolation</title>
                <meta charSet='utf8' />
            </head>
            <body>
                <div id='replace-foo'>Text to be replaced.</div>
                <div id='replace-bar'>Text to be replaced.</div>
                {includeScript('./bar.mjs', import.meta)}
            </body>
        </html>
    ));
}
