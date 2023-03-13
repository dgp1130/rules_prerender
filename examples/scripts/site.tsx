import { PrerenderResource, includeScript, renderToHtml } from '@rules_prerender/preact';
import { Component } from './component/component.js';

/** Render some HTML with a `<script />` tag. */
export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', renderToHtml(
        <html>
            <head>
                <title>Scripts</title>
            </head>
            <body>
                <h2>Scripts</h2>
                <div id="replace">
                    This text to be overwritten by client-side JavaScript.
                </div>
                {includeScript('./script.mjs', import.meta)}
                <Component />
            </body>
        </html>
    ));
}
