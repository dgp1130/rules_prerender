import { PrerenderResource, includeScript, includeStyle } from 'rules_prerender';

export default function* (): Iterable<PrerenderResource> {
    yield PrerenderResource.of('/index.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>Multi-Page</title>
        <meta charset="utf-8">

        ${includeScript('rules_prerender/examples/multi_page/script')}
        ${includeStyle('rules_prerender/examples/multi_page/styles.css')}
    </head>
    <body>
        <h2>Multi-Page</h2>
        <img src="/logo.png" />
        <nav>
            <ul>
                <li><a href="/foo.html">/foo.html</a></li>
                <li><a href="/bar.html">/bar.html</a></li>
                <li><a href="/hello/world.html">/hello/world.html</a></li>
            </ul>
        </nav>
    </body>
</html>
    `.trim());
    yield PrerenderResource.of('/foo.html', 'foo');
    yield PrerenderResource.of('/bar.html', 'bar');
    yield PrerenderResource.of('/hello/world.html', 'Hello, World!');
}
