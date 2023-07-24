import { VNode, ComponentChildren } from 'preact';

/**
 * Renders the base layout for documentation. Most pages should use this.
 * 
 * @param title The title of the page.
 * @param children Children to render under the `<main>` element. Callers should
 *     *not* render `<main>` themselves, `Layout` will do it automatically.
 */
export function Layout({ title, children }: {
    title: string,
    children: ComponentChildren,
}): VNode {
    return <html lang="en">
        <head>
            <meta charSet="utf8" />
            <title>@rules_prerender - {title}</title>
        </head>
        <body>
            <main>{children}</main>
        </body>
    </html>;
}
