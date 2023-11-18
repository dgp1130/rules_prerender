import { Template } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { inlineStyle } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { Layout } from '../../components/layout/layout.js';
import { UnderConstructionBanner } from '../../components/under_construction_banner/under_construction_banner_prerender.js';
import { type Route } from '../../routing.mjs';

/** Renders a 404 Not Found page. */
export function NotFound({ currentRoute, routes }: {
    currentRoute: Route,
    routes: Route[],
}): VNode {
    return <Layout
        pageTitle="Not Found"
        currentRoute={currentRoute}
        routes={routes}
    >
        <div>
            <Template shadowrootmode="open">
                <UnderConstructionBanner id="banner" />

                <h2>Not Found</h2>

                <p>
                    This page could not be found. If you clicked on a dead link,
                    consider being a good netizen and letting the owner know so
                    they can fix it.
                </p>

                {inlineStyle('./not_found.css', import.meta)}
            </Template>
        </div>
    </Layout>;
}
