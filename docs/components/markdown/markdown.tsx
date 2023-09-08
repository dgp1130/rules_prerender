import { Template } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { inlineStyle } from '@rules_prerender/preact';
import { type VNode } from 'preact';
import { Layout } from '../layout/layout.js';
import { Route } from '../../route.mjs';
import { MarkdownPage } from '../../markdown/markdown_page.mjs';

/**
 * Renders a docs page based on the given runfiles path to the markdown file.
 *
 * @param page The runfiles-relative path to the markdown file to render.
 * @param routes Routes to render page navigation with.
 */
export function Markdown({ page, routes }: {
    page: MarkdownPage,
    routes?: readonly Route[],
}): VNode {
    return <Layout
        pageTitle={page.metadata.title}
        headerTitle={page.metadata.title}
        routes={routes}
    >
        <div>
            <Template shadowrootmode="open">
                {inlineStyle('./markdown.css', import.meta)}

                <div id="md" dangerouslySetInnerHTML={{
                    __html: page.html.getHtmlAsString(),
                }}></div>
            </Template>
        </div>
    </Layout>;
}
