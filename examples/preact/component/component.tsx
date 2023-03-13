import { Template, includeScript, inlineStyle } from '@rules_prerender/preact';
import { ComponentChildren, VNode } from 'preact';

declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            'my-component': JSX.HTMLAttributes;
        }
    }
}

export function Component({ text, children }: {
    text: string,
    children: ComponentChildren,
}): VNode {
    return <my-component id='component'>
        <Template shadowroot='open'>
            <h2>{text}</h2>
            <div id="replace">This text to be replaced by page JavaScript.</div>
            <slot></slot>

            {includeScript('./script.mjs', import.meta)}
            {inlineStyle('./style.css', import.meta)}
        </Template>
        {children}
    </my-component>;
}
