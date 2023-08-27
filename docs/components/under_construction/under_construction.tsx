import { VNode } from 'preact';
import { Layout } from '../layout/layout.js';
import { Route } from '../../route.mjs';

/** Renders a "under construction" placeholder page. */
export function UnderConstruction({ pageTitle, headerTitle, routes } : {
    pageTitle: string,
    headerTitle?: string,
    routes: readonly Route[],
}): VNode {
    return <Layout
        pageTitle={`${pageTitle} - Under Construction`}
        headerTitle={headerTitle}
        routes={routes}
    >
        <div>This page is under construction.</div>
    </Layout>;
}
