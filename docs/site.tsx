import { SafeHtml } from 'rules_prerender';
import { renderToHtml } from '@rules_prerender/preact';
import { UnderConstruction } from './components/under_construction/under_construction.js';
import { type Route, bootstrap } from './routing.mjs';
import { IndexPage } from './www/index.js';
import { NotFound } from './www/not_found/not_found.js';
import { Markdown } from './components/markdown/markdown.js';
import { renderMarkdown } from './markdown/markdown_loader.mjs';
import { type MarkdownPage, parsePageMetadata } from './markdown/markdown_page.mjs';

export default bootstrap([
    {
        label: 'Home',
        path: '',
        render: (currentRoute, routes) => renderToHtml(<IndexPage
            currentRoute={currentRoute}
            routes={routes}
        />),
    },
    {
        label: 'Tutorials',
        path: 'tutorials',
        children: [
            {
                label: 'Getting Started',
                path: 'getting-started/',
                render: async (currentRoute, routes) =>
                    await renderMarkdownPage(
                        'rules_prerender/docs/www/tutorials/getting_started/getting_started.md',
                        currentRoute,
                        routes,
                    )
                ,
            },
            {
                label: 'Components',
                path: 'components/',
                render: async (currentRoute, routes) =>
                    await renderMarkdownPage(
                        'rules_prerender/docs/www/tutorials/components/components.md',
                        currentRoute,
                        routes,
                    )
                ,
            },
            {
                label: 'Rendering Markdown',
                path: 'rendering-markdown/',
                render: (currentRoute, routes) => renderToHtml(
                    <UnderConstruction
                        pageTitle={currentRoute.label}
                        headerTitle={currentRoute.label}
                        currentRoute={currentRoute}
                        routes={routes}
                    />
                ),
            },
        ],
    },
    {
        label: 'Concepts',
        path: 'concepts',
        children: [
            {
                label: 'Components',
                path: 'components/',
                render: (currentRoute, routes) => renderToHtml(
                    <UnderConstruction
                        pageTitle={currentRoute.label}
                        headerTitle={currentRoute.label}
                        currentRoute={currentRoute}
                        routes={routes}
                    />
                ),
            },
            {
                label: 'Bundling',
                path: 'bundling/',
                render: (currentRoute, routes) => renderToHtml(
                    <UnderConstruction
                        pageTitle={currentRoute.label}
                        headerTitle={currentRoute.label}
                        currentRoute={currentRoute}
                        routes={routes}
                    />
                ),
            },
        ],
    },
    {
        label: 'API Reference',
        path: 'reference/',
        render: (currentRoute, routes) => renderToHtml(
            <UnderConstruction
                pageTitle={currentRoute.label}
                headerTitle={currentRoute.label}
                currentRoute={currentRoute}
                routes={routes}
            />
        ),
    },
    {
        label: 'Privacy Policy',
        path: 'privacy/',
        hiddenChild: true,
        render: (currentRoute, routes) => renderToHtml(
            <UnderConstruction
                pageTitle={currentRoute.label}
                headerTitle={currentRoute.label}
                currentRoute={currentRoute}
                routes={routes}
            />
        ),
    },
    {
        label: 'Not Found',
        path: 'not-found/',
        hiddenChild: true,
        render: (currentRoute, routes) => renderToHtml(
            <NotFound currentRoute={currentRoute} routes={routes} />
        ),
    },
]);

/**
 * Renders a markdown page with a fetch-then-render architecture. Reads the
 * markdown content first and then renders the full page. This avoids async and
 * `<Suspense />` challenges.
 */
async function renderMarkdownPage(
    page: string,
    currentRoute: Route,
    routes: Route[],
): Promise<SafeHtml> {
    const { frontmatter, html } = await renderMarkdown(page);
    const metadata = parsePageMetadata(page, frontmatter);
    const markdownPage: MarkdownPage = { metadata, html };

    return renderToHtml(<Markdown
        page={markdownPage}
        currentRoute={currentRoute}
        routes={routes}
    />);
}
