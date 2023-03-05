import { PrerenderResource, inlineStyle } from 'rules_prerender';

/** Generates a page with an inline style in a declarative shadow root. */
export default function* (): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>Inline Styles</title>
    </head>
    <body>
        <div id="shadowroot">
            <template shadowroot="open">
                <div id="hello">Hello, World!</div>
                ${inlineStyle('./styles.css', import.meta)}
            </template>
        </div>
        <div id="goodbye">Goodbye, World!</div>
    </body>
</html>
    `.trim());
}
