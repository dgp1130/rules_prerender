import { Template, includeScript, inlineStyle } from '@rules_prerender/preact';
import { ComponentChildren, VNode } from 'preact';

export function Component({ text, children }: {
    text: string,
    children: ComponentChildren,
}): VNode {
    return <div id="component">
        <Template shadowroot="open">
            <h2>{text}</h2>
            <slot></slot>

            {includeScript('./script.mjs', import.meta)}
            {inlineStyle('./style.css', import.meta)}
        </Template>
        <div id="replace">This text to be replaced by page JavaScript.</div>
        {children}
    </div>;
}
