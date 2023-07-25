import { VNode } from 'preact';
import { Template, includeScript, inlineStyle } from '@rules_prerender/preact';
import { polyfillDeclarativeShadowDom } from '@rules_prerender/declarative_shadow_dom/preact.mjs';

declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            'my-component': JSX.HTMLAttributes<HTMLElement>;
        }
    }
}

export function Component(): VNode {
    return <my-component>
        <Template shadowrootmode="open">
            <img src="/logo" />
            <span>Component</span>
            <div id="replace">This text to be replaced by JavaScript.</div>

            {polyfillDeclarativeShadowDom()}
            {includeScript('./script.mjs', import.meta)}
            {inlineStyle('./style.css', import.meta)}
        </Template>
    </my-component>;
}
