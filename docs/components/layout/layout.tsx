import { inlineStyle } from '@rules_prerender/preact';
import { VNode, ComponentChildren } from 'preact';
import { Footer } from '../footer/footer.js';
import { Header } from '../header/header.js';
import { NavPane } from '../nav_pane/nav_pane.js';
import { Route } from '../../route.mjs';

/**
 * Renders the base layout for documentation. Most pages should use this.
 *
 * @param pageTitle The `<title>` element of the page.
 * @param headerTitle The title to display in the page header element.
 * @param children Children to render under the `<main>` element. Callers should
 *     *not* render `<main>` themselves, `Layout` will do it automatically.
 * @param headChildren Children to render under the `<head>` element. Callers
 *     should *not* render `<title>` or `<meta charset="utf8">`, `Layout` will
 *     do that automatically.
 * @param routes List of routes to render in the navigation pane.
 */
export function Layout({
    pageTitle,
    headerTitle,
    children,
    headChildren,
    routes = [],
}: {
    pageTitle: string,
    headerTitle?: string,
    children: ComponentChildren,
    headChildren?: ComponentChildren,
    routes?: readonly Route[],
}): VNode {
    return <html lang="en">
        <head>
            <meta charSet="utf8" />
            <title>@rules_prerender - {pageTitle}</title>
            {inlineStyle('./layout.css', import.meta)}
            {headChildren}
        </head>
        <body>
            <Header title={headerTitle} />
            <div class="layout-middle">
                {routes.length
                    ? <NavPane routes={routes} />
                    : undefined
                }
                <main>{children}</main>
            </div>
            <Footer />
        </body>
    </html>;
}
