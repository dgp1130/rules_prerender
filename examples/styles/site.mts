import { PrerenderResource, html, inlineStyle, renderToHtml } from '@rules_prerender/lit_engine';

/** Generates a page with an inline style in a declarative shadow root. */
export default async function* (): AsyncGenerator<PrerenderResource, void, void> {
    yield PrerenderResource.fromHtml('/index.html', await renderToHtml(html`
<!DOCTYPE html>
<html>
    <head>
        <title>Inline Styles</title>
    </head>
    <body>
        <div id="shadowroot">
            <template shadowrootmode="open">
                <div id="hello">Hello, World!</div>
                ${inlineStyle('./styles.css', import.meta)}
            </template>
        </div>
        <div id="goodbye">Goodbye, World!</div>
    </body>
</html>
    `));
}
