import { PrerenderResource, includeScript, includeStyle } from 'rules_prerender';

export default function* (): Iterable<PrerenderResource> {
    yield PrerenderResource.of('/index.html', generate(`
<h2>Multi-Page</h2>
<img src="/logo.png" />
<nav>
    <ul>
        <li><a href="/foo.html">/foo.html</a></li>
        <li><a href="/bar.html">/bar.html</a></li>
        <li><a href="/hello/world.html">/hello/world.html</a></li>
    </ul>
</nav>
    `));
    yield PrerenderResource.of('/foo.html', generate('<h2>Foo</h2>'));
    yield PrerenderResource.of('/bar.html', generate('<h2>Bar</h2>'));
    yield PrerenderResource.of(
        '/hello/world.html',
        generate('<h2>Hello, World!</h2>'),
    );
}

function generate(content: string): string {
    return `
<!DOCTYPE html>
<html>
    <head>
        <title>Multi-Page</title>
        <meta charset="utf-8">

        ${includeScript('rules_prerender/examples/multi_page/script')}
        ${includeStyle('rules_prerender/examples/multi_page/styles.css')}
    </head>
    <body>
        ${content}
        <div id="replace">
            This text to be overwritten by client-side JavaScript.
        </div>
    </body>
</html>
    `.trim();
}
