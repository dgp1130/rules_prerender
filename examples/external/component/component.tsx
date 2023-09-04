import { VNode } from 'preact';
import { Template } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { includeScript, inlineStyle } from '@rules_prerender/preact';

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

            {includeScript('./script.mjs', import.meta)}
            {inlineStyle('./style.css', import.meta)}
        </Template>
    </my-component>;
}
