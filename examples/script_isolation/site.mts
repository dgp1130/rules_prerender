import { includeScript, PrerenderResource } from 'rules_prerender';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>Script Isolation</title>
        <meta charset="utf8">
    </head>
    <body>
        <ul>
            <li><a href="/foo.html">Foo</a></li>
            <li><a href="/bar.html">Bar</a></li>
        </ul>
    </body>
</html>
    `.trim());

    yield PrerenderResource.of('/foo.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>Script Isolation</title>
        <meta charset="utf8">
    </head>
    <body>
        <div id="replace-foo">Text to be replaced.</div>
        <div id="replace-bar">Text to be replaced.</div>
        ${includeScript('./foo.mjs', import.meta)}
    </body>
</html>
    `.trim());

    yield PrerenderResource.of('/bar.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>Script Isolation</title>
        <meta charset="utf8">
    </head>
    <body>
        <div id="replace-foo">Text to be replaced.</div>
        <div id="replace-bar">Text to be replaced.</div>
        ${includeScript('./bar.mjs', import.meta)}
    </body>
</html>
    `.trim());
}
