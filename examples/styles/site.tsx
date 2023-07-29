import { polyfillDeclarativeShadowDom } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { PrerenderResource, Template, inlineStyle, renderToHtml } from '@rules_prerender/preact';

/** Generates a page with an inline style in a declarative shadow root. */
export default function* (): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.fromHtml('/index.html', renderToHtml(
        <html>
            <head>
                <title>Inline Styles</title>
            </head>
            <body>
                <div id='shadowroot'>
                    <Template shadowrootmode='open'>
                        {polyfillDeclarativeShadowDom()}

                        <div id='hello'>Hello, World!</div>
                        {inlineStyle('./styles.css', import.meta)}
                    </Template>
                </div>
                <div id='goodbye'>Goodbye, World!</div>
            </body>
        </html>
    ));
}
