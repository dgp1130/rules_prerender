import { inlineStyle } from '@rules_prerender/preact';
import { VNode, ComponentChildren } from 'preact';
import { Footer } from '../../components/footer/footer.js';
import { Header } from '../../components/header/header.js';

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
 */
export function Layout({ pageTitle, headerTitle, children, headChildren }: {
    pageTitle: string,
    headerTitle?: string,
    children: ComponentChildren,
    headChildren?: ComponentChildren,
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
            <main>{children}</main>
            <Footer />
        </body>
    </html>;
}
