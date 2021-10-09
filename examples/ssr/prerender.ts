import { PrerenderResource } from 'rules_prerender';
import { prerenderBar } from 'rules_prerender/examples/ssr/bar_component/bar_prerender';
import { prerenderFoo } from 'rules_prerender/examples/ssr/foo_component/foo_prerender';
import { prerenderStreaming } from 'rules_prerender/examples/ssr/streaming_component/streaming_prerender';
import { prerenderParallel } from 'rules_prerender/examples/ssr/parallel_component/parallel_prerender';
import { prerenderRequest } from 'rules_prerender/examples/ssr/request_component/request_prerender';
import { prerenderComposition } from 'rules_prerender/examples/ssr/composition_component/composition_prerender';

export default function* (): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', page(`
<ul>
    <li>First chunk (component)</li>
    ${prerenderFoo('World')}
    <li>Second chunk (composing components)</li>
    ${prerenderBar()}
    <li>Third chunk (streaming)</li>
    ${prerenderStreaming()}
    <li>Fourth chunk (parallel)</li>
    ${prerenderParallel()}
    <li>Fifth chunk (request)</li>
    ${prerenderRequest()}
    <li>Sixth chunk (composition)</li>
    ${prerenderComposition()}
</ul>
    `).trim());

    yield PrerenderResource.of('/foo.html', page(prerenderFoo('World')));
    yield PrerenderResource.of('/bar.html', page(prerenderBar()));
    yield PrerenderResource.of('/streaming.html', page(prerenderStreaming()));
    yield PrerenderResource.of('/parallel.html', page(prerenderParallel()));
    yield PrerenderResource.of('/request.html', page(prerenderRequest()));
    yield PrerenderResource.of(
        '/composition.html', page(prerenderComposition()));
}

function page(content: string): string {
    return `
<!DOCTYPE html>
<html>
    <head>
        <title>Test</title>
    </head>
    <body>
        ${content}
    </body>
</html>
    `.trim();
}