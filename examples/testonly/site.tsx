import { PrerenderResource, Template, inlineStyle, includeScript, renderToHtml } from '@rules_prerender/preact';
import { Component } from './component/component.js';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.fromHtml('/index.html', renderToHtml(
        <html>
            <head>
                <title>Testonly</title>
                <meta charSet='utf8' />
            </head>
            <body>
                <h2>Testonly</h2>

                <div>
                    <Template shadowroot='open'>
                        <span>Hello from a testonly page!</span>
                        <img src='/images/site.png' />
                        <slot></slot>

                        {includeScript('./site_script.mjs', import.meta)}
                        {inlineStyle('./site_styles.css', import.meta)}
                    </Template>
                    <Component />
                </div>
            </body>
        </html>
    ));
}
