import { PrerenderResource, includeScript, renderToHtml } from '@rules_prerender/preact';
import { JsParent } from './js_parent/js_parent.mjs';
import { TsParent } from './ts_parent/ts_parent.js';

export default function*(): Generator<PrerenderResource, void, void> {
    // Index page to list the various test cases.
    yield PrerenderResource.of('/index.html', renderToHtml(
        <html>
            <head>
                <title>TS/JS</title>
                <meta charSet='utf8' />
            </head>
            <body>
                <ul>
                    <li><a href='/js-depends-on-ts.html'>JS depends on TS</a></li>
                    <li><a href='/ts-depends-on-js.html'>TS depends on JS</a></li>
                    <li><a href='/ts-script-depends-on-js-script.html'>
                        TS script depends on JS script
                    </a></li>
                    <li><a href='/js-script-depends-on-ts-script.html'>
                        JS script depends on TS script
                    </a></li>
                </ul>
            </body>
        </html>,
    ));

    // Test case for JS depending on TS.
    yield PrerenderResource.of('/js-depends-on-ts.html', renderToHtml(
        <html>
            <head>
                <title>JS depends on TS</title>
                <meta charSet='utf8' />
            </head>
            <body>
                <JsParent />
            </body>
        </html>,
    ));

    // Test case for TS depending on JS.
    yield PrerenderResource.of('/ts-depends-on-js.html', renderToHtml(
        <html>
            <head>
                <title>TS depends on JS</title>
                <meta charSet='utf8' />
            </head>
            <body>
                <TsParent />
            </body>
        </html>,
    ));

    // Test case for client-side TS depending on JS.
    yield PrerenderResource.of(
        '/ts-script-depends-on-js-script.html',
        renderToHtml(
            <html>
                <head>
                    <title>TS script depends on JS script</title>
                    <meta charSet='utf8' />
                </head>
                <body>
                    <div id='replace-ts-parent-script'>
                        Text to be replaced by client-side JS.
                    </div>

                    {includeScript('./ts_parent_script.mjs', import.meta)}
                </body>
            </html>,
        ),
    );

    // Test case for client-side JS depending on TS.
    yield PrerenderResource.of(
        '/js-script-depends-on-ts-script.html',
        renderToHtml(
            <html>
                <head>
                    <title>JS script depends on TS script</title>
                    <meta charSet='utf8' />
                </head>
                <body>
                    <div id='replace-js-parent-script'>
                        Text to be replaced by client-side JS.
                    </div>

                    {includeScript('./js_parent_script.mjs', import.meta)}
                </body>
            </html>,
        ),
    );
}
