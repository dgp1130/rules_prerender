import { PrerenderResource } from 'rules_prerender';

export default function* (): Iterable<PrerenderResource> {
    yield PrerenderResource.of('/index.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>Multi-Page</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h2>Multi-Page</h2>
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
