import { inlineStyle } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { Layout } from '../components/layout/layout.js';
import { Route } from '../route.mjs';

/** Renders the root index page of the docs site. */
export function IndexPage({ routes }: { routes: readonly Route[] }): VNode {
    return <Layout
        pageTitle="Documentation Home"
        headerTitle="rules_prerender"
        headChildren={inlineStyle('./index.css', import.meta)}
        routes={routes}
    >
        <h2>Hello, World!</h2>
    </Layout>;
}
