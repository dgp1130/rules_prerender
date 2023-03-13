import { PrerenderResource, includeScript, renderToHtml } from '@rules_prerender/preact';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', renderToHtml(
        <html>
            <head>
                <title>Shared Chunks</title>
                <meta charSet='utf8' />
            </head>
            <body>
                <ul>
                    <li><a href='/hello.html'>Hello</a></li>
                    <li><a href='/goodbye.html'>Goodbye</a></li>
                </ul>
            </body>
        </html>
    ));

    yield PrerenderResource.of('/hello.html', renderToHtml(
        <html>
            <head>
                <title>Shared Chunks</title>
                <meta charSet='utf8' />
            </head>
            <body>
                <h2>Check console</h2>
                {includeScript('./hello.mjs', import.meta)}
            </body>
        </html>
    ));

    yield PrerenderResource.of('/goodbye.html', renderToHtml(
        <html>
            <head>
                <title>Shared Chunks</title>
                <meta charSet='utf8' />
            </head>
            <body>
                <h2>Check console</h2>
                {includeScript('./goodbye.mjs', import.meta)}
            </body>
        </html>
    ));
}
