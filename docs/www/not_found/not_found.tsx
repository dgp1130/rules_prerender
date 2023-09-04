import { Template } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { inlineStyle } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { Layout } from '../../components/layout/layout.js';
import { Route } from '../../route.mjs';

/** Renders a 404 Not Found page. */
export function NotFound({ routes }: { routes: readonly Route[] }): VNode {
    return <Layout pageTitle="Not Found" routes={routes}>
        <div>
            <Template shadowrootmode="open">
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
