import { Layout } from './components/layout/layout.js';
import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.fromHtml('/index.html', renderToHtml(
        <Layout title="Documentation Home">
            <div>Hello World!</div>
        </Layout>
    ));
}
