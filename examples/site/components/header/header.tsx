import { polyfillDeclarativeShadowDom } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { Template, inlineStyle } from '@rules_prerender/preact';
import { VNode } from 'preact';

/** Renders a header component with navigation to the rest of the site. */
export function Header(): VNode {
    return <header>
        <Template shadowrootmode="open">
            <h1>My super cool site!</h1>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/counter/">Counter</a></li>
                    <li><a href="/blog/">Blog</a></li>
                    <li><a href="/about/">About</a></li>
                </ul>
            </nav>

            {polyfillDeclarativeShadowDom()}
            {inlineStyle('./header.css', import.meta)}
        </Template>
    </header>;
}
