import { includeScript, inlineStyle, PrerenderResource } from 'rules_prerender';

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
        ${includeScript('script.js')}
        ${inlineStyle('external/style.css')}
    </body>
</html>
    `.trim());
}
