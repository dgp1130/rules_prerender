import { PrerenderResource, inlineStyle, includeScript, renderToHtml } from '@rules_prerender/preact';
import { Component } from './component/component.js';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', renderToHtml(
        <html>
            <head>
                <title>Testonly</title>

                {inlineStyle('./site_styles.css', import.meta)}
            </head>
            <body>
                <h2>Testonly</h2>

                <div class='site'>
                    <span class='hello'>Hello from a testonly page!</span>
                    <img src='/images/site.png' />
                    <Component />
                    {includeScript('./site_script.mjs', import.meta)}
                </div>
            </body>
        </html>
    ));
}
