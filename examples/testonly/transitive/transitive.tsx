import { Template, includeScript, inlineStyle } from '@rules_prerender/preact';
import { VNode } from 'preact';

export function Transitive(): VNode {
    return <div>
        <Template shadowrootmode='open'>
            <span>Hello from the transitive component!</span>
            <img src='/images/transitive.png' />

            {includeScript('./transitive_script.mjs', import.meta)}
            {inlineStyle('./transitive_styles.css', import.meta)}
        </Template>
    </div>;
}
