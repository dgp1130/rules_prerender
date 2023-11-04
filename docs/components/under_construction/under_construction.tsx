import { Template } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { inlineStyle } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { Layout } from '../layout/layout.js';
import { type Route } from '../../routing.mjs';

/** Renders a "under construction" placeholder page. */
export function UnderConstruction({
    pageTitle,
    headerTitle,
    currentRoute,
    routes,
}: {
    pageTitle: string,
    headerTitle?: string,
    currentRoute: Route,
    routes: Route[],
}): VNode {
    return <Layout
        pageTitle={`${pageTitle} - Under Construction`}
        headerTitle={headerTitle}
        currentRoute={currentRoute}
        routes={routes}
    >
        <div>
            <Template shadowrootmode="open">
                <h2>This page is under construction.</h2>

                <p>
                    Please check back later for this content. Alternatively, you
                    can also make an issue or discussion <a href="https://github.com/dgp1130/rules_prerender/" rel="noopener" target="_blank">on GitHub</a> as well as
                    reach out to the maintainer <a href="https://blog.dwac.dev/social/" rel="noopener" target="_blank">directly</a>.
                </p>

                {inlineStyle('./under_construction.css', import.meta)}
            </Template>
        </div>
    </Layout>;
}
