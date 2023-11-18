import { Template } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { inlineStyle } from '@rules_prerender/preact';
import { type VNode } from 'preact';
import { Layout } from '../layout/layout.js';
import { type Route } from '../../routing.mjs';
import { MarkdownPage } from '../../markdown/markdown_page.mjs';
import { UnderConstructionBanner } from '../under_construction_banner/under_construction_banner_prerender.js';

/**
 * Renders a docs page based on the given runfiles path to the markdown file.
 *
 * @param page The runfiles-relative path to the markdown file to render.
 * @param currentRoute Reference to a specific route in the {@param routes}
 *     forest which this layout is currently rendering.
 * @param routes Routes to render page navigation with.
 */
export function Markdown({
    page,
    currentRoute,
    routes,
    underConstruction = true,
}: {
    page: MarkdownPage,
    currentRoute: Route,
    routes: Route[],
    underConstruction?: boolean,
}): VNode {
    return <Layout
        pageTitle={page.metadata.title}
        headerTitle={page.metadata.title}
        currentRoute={currentRoute}
        routes={routes}
    >
        <div>
            <Template shadowrootmode="open">
                {inlineStyle('./markdown.css', import.meta)}

                {underConstruction
                    ? <UnderConstructionBanner id="banner" />
                    : undefined}

                <div id="md" dangerouslySetInnerHTML={{
                    __html: page.html.getHtmlAsString(),
                }}></div>
            </Template>
        </div>
    </Layout>;
}
