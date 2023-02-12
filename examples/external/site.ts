import { includeScript, inlineStyle, PrerenderResource } from 'rules_prerender';
import { polyfillDeclarativeShadowDom } from '@rules_prerender/declarative_shadow_dom';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>Test</title>
        <meta charset="utf8">
    </head>
    <body>
        <h2>Hello, World!</h2>
        <img src="/logo">

        <div>
            <template shadowroot="open">
                ${polyfillDeclarativeShadowDom()}
                <h2>Component</h2>
                ${includeScript('script.js')}
                ${inlineStyle('external/style.css')}
            </template>
        </div>
    </body>
</html>
    `.trim());
}
