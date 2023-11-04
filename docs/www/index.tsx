import { inlineStyle } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { Layout } from '../components/layout/layout.js';
import { type Route } from '../routing.mjs';

/** Renders the root index page of the docs site. */
export function IndexPage({ currentRoute, routes }: {
    currentRoute: Route,
    routes: Route[],
}): VNode {
    return <Layout
        pageTitle="Documentation Home"
        headerTitle="rules_prerender"
        headChildren={inlineStyle('./index.css', import.meta)}
        currentRoute={currentRoute}
        routes={routes}
    >
        <h2>Hello, World!</h2>
    </Layout>;
}
