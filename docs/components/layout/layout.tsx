import { VNode } from 'preact';

/** TODO */
export function Layout({ title, children }: { title: string, children: VNode }): VNode {
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
