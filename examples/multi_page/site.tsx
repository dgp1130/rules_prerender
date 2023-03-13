import { PrerenderResource, includeScript, inlineStyle, renderToHtml } from '@rules_prerender/preact';
import { ComponentChildren, VNode } from 'preact';

export default function* (): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', renderToHtml(
        <Page>
            <h2>Multi-Page</h2>
            <img src="/logo.png" />
            <nav>
                <ul>
                    <li><a href="/foo.html">/foo.html</a></li>
                    <li><a href="/bar.html">/bar.html</a></li>
                    <li><a href="/hello/world.html">/hello/world.html</a></li>
                </ul>
            </nav>
        </Page>,
    ));

    yield PrerenderResource.of('/foo.html', renderToHtml(
        <Page>
            <h2>Foo</h2>
        </Page>,
    ));
    yield PrerenderResource.of('/bar.html', renderToHtml(
        <Page>
            <h2>Bar</h2>
        </Page>,
    ));
    yield PrerenderResource.of('/hello/world.html', renderToHtml(
        <Page>
            <h2>Hello, World!</h2>
        </Page>,
    ));
}

function Page({ children }: { children: ComponentChildren }): VNode {
    return (
        <html>
            <head>
                <title>Multi-Page</title>
                <meta charSet="utf-8" />

                {includeScript('./script.mjs', import.meta)}
                {inlineStyle('./styles.css', import.meta)}
            </head>
            <body>
                {children}
                <div id="replace">
                    This text to be overwritten by client-side JavaScript.
                </div>
            </body>
        </html>
    );
}
