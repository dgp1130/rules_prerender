import { PrerenderResource, inlineStyle, renderToHtml } from '@rules_prerender/preact';
import { Layout } from './components/layout/layout.js';
import { Route } from './route.mjs';

/** Docs site routes. */
export const routes: readonly Route[] = [
    {
        label: 'Home',
        content: '/',
    },
    {
        label: 'Tutorials',
        content: [
            {
                label: 'Getting Started',
                content: '/tutorials/getting-started/',
            },
            {
                label: 'Rendering Markdown',
                content: '/tutorials/rendering-markdown/',
            },
        ],
    },
    {
        label: 'Concepts',
        content: [
            {
                label: 'Components',
                content: '/concepts/components/',
            },
            {
                label: 'Bundling',
                content: '/concepts/bundling/',
            },
        ],
    },
    {
        label: 'API Reference',
        content: '/reference/',
    },
];

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.fromHtml('/index.html', renderToHtml(
        <Layout
            pageTitle="Documentation Home"
            headerTitle="rules_prerender"
            headChildren={inlineStyle('./site.css', import.meta)}
            routes={routes}
        >
            <div>Hello World!</div>
        </Layout>
    ));
}
