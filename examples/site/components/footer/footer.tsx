import { polyfillDeclarativeShadowDom } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { Template, inlineStyle } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { repo } from '../../common/links.mjs';

/** Renders a footer component for the site. */
export function Footer(): VNode {
    return <footer>
        <Template shadowroot="open">
            <div>
                Made with <a href='https://bazel.build/' rel='noopener' target='_blank'>Bazel</a> and <a href={repo.toString()} rel='noopener' target='_blank'>rules_prerender</a>.
            </div>

            {polyfillDeclarativeShadowDom()}
            {inlineStyle('./footer.css', import.meta)}
        </Template>
    </footer>;
}
