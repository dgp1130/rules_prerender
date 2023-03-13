import { Template, includeScript, inlineStyle } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { Transitive } from '../transitive/transitive.js';

export function Component(): VNode {
    return <div>
        <Template shadowroot='open'>
            <span>Hello from the component!</span>
            <img src='/images/component.png' />
            <slot></slot>

            {includeScript('./component_script.mjs', import.meta)}
            {inlineStyle('./component_styles.css', import.meta)}
        </Template>
        <Transitive />
    </div>;
}
