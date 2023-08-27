import { PrerenderResource, inlineStyle, renderToHtml } from '@rules_prerender/preact';
import { Layout } from './components/layout/layout.js';
import { UnderConstruction } from './components/under_construction/under_construction.js';
import { Route } from './route.mjs';
import { NotFound } from './www/not_found/not_found.js';

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

    yield* renderTutorials();
    yield* renderConcepts();
    yield* renderApiReference();

    yield PrerenderResource.fromHtml('/privacy/index.html', renderToHtml(
        <UnderConstruction
            pageTitle="Privacy Policy"
            headerTitle="Privacy Policy"
            routes={routes}
        />
    ));

    yield PrerenderResource.fromHtml('/not-found/index.html', renderToHtml(
        <NotFound routes={routes} />
    ));
}

function* renderTutorials(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.fromHtml(
        '/tutorials/getting-started/index.html',
        renderToHtml(<UnderConstruction
            pageTitle="Getting Started"
            headerTitle="Getting Started"
            routes={routes}
        />),
    );

    yield PrerenderResource.fromHtml(
        '/tutorials/rendering-markdown/index.html',
        renderToHtml(<UnderConstruction
            pageTitle="Rendering Markdown"
            headerTitle="Rendering Markdown"
            routes={routes}
        />),
    );
}

function* renderConcepts(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.fromHtml(
        '/concepts/components/index.html',
        renderToHtml(<UnderConstruction
            pageTitle="Components"
            headerTitle="Components"
            routes={routes}
        />),
    );

    yield PrerenderResource.fromHtml(
        '/concepts/bundling/index.html',
        renderToHtml(<UnderConstruction
            pageTitle="Bundling"
            headerTitle="Bundling"
            routes={routes}
        />),
    );
}

function* renderApiReference(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.fromHtml(
        '/reference/index.html',
        renderToHtml(<UnderConstruction
            pageTitle="API Reference"
            headerTitle="API Reference"
            routes={routes}
        />),
    );
}
