import { Template } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { inlineStyle } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { Layout } from '../components/layout/layout.js';
import { UnderConstructionBanner } from '../components/under_construction_banner/under_construction_banner_prerender.js';
import { type Route } from '../routing.mjs';

/** Renders the root index page of the docs site. */
export function IndexPage({ currentRoute, routes }: {
    currentRoute: Route,
    routes: Route[],
}): VNode {
    return <Layout
        pageTitle="Documentation Home"
        headerTitle="rules_prerender"
        headChildren={inlineStyle('./index_global.css', import.meta)}
        currentRoute={currentRoute}
        routes={routes}
    >
        <div>
            <Template shadowrootmode="open">
                {inlineStyle('./index.css', import.meta)}

                <UnderConstructionBanner id="banner" />

                <h2>Hello, World!</h2>
            </Template>
        </div>
    </Layout>;
}
