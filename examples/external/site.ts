import { PrerenderResource } from 'rules_prerender';

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
    </body>
</html>
    `.trim());
}
