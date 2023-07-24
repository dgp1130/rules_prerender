import { Layout } from './components/layout/layout.js';
import { PrerenderResource, inlineStyle, renderToHtml } from '@rules_prerender/preact';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.fromHtml('/index.html', renderToHtml(
        <Layout
            pageTitle="Documentation Home"
            headerTitle="rules_prerender"
            headChildren={inlineStyle('./site.css', import.meta)}
        >
            <div>Hello World!</div>
        </Layout>
    ));
}
