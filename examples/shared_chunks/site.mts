import { includeScript, PrerenderResource } from 'rules_prerender';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>Shared Chunks</title>
        <meta charset="utf8">
    </head>
    <body>
        <ul>
            <li><a href="/hello.html">Hello</a></li>
            <li><a href="/goodbye.html">Goodbye</a></li>
        </ul>
    </body>
</html>
    `.trim());

    yield PrerenderResource.of('/hello.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>Shared Chunks</title>
        <meta charset="utf8">
    </head>
    <body>
        <h2>Check console</h2>
        ${includeScript('examples/shared_chunks/hello.mjs')}
    </body>
</html>
    `.trim());

    yield PrerenderResource.of('/goodbye.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>Shared Chunks</title>
        <meta charset="utf8">
    </head>
    <body>
        <h2>Check console</h2>
        ${includeScript('examples/shared_chunks/goodbye.mjs')}
    </body>
</html>
    `.trim());
}
