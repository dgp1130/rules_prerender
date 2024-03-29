import { Template } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { includeScript, inlineStyle } from '@rules_prerender/preact';
import { ComponentChildren, VNode } from 'preact';

declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            'my-component': JSX.HTMLAttributes<HTMLElement>;
        }
    }
}

export function Component({ text, children }: {
    text: string,
    children: ComponentChildren,
}): VNode {
    return <my-component id='component'>
        <Template shadowrootmode='open'>
            <h2>{text}</h2>
            <div id="replace">This text to be replaced by page JavaScript.</div>
            <slot></slot>

            {includeScript('./script.mjs', import.meta)}
            {inlineStyle('./style.css', import.meta)}
        </Template>
        {children}
    </my-component>;
}
