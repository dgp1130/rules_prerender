import { polyfillDeclarativeShadowDom } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { Template, includeScript, inlineStyle } from '@rules_prerender/preact';
import { Transitive } from '../transitive/transitive.prerender.js';
import { VNode } from 'preact';

export function Component({ name }: { name: string }): VNode {
    return <div>
        <Template shadowroot='open'>
            <img src="/logo.png" />
            <span>Hello to {name} from component!</span>
            <slot></slot>

            {polyfillDeclarativeShadowDom()}
            {includeScript('./component.client.mjs', import.meta)}
            {inlineStyle('./component.css', import.meta)}
        </Template>

        <Transitive name={name} />
    </div>;
}
