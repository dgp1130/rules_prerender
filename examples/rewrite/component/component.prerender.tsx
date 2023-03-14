import { includeScript, inlineStyle } from '@rules_prerender/preact';
import { Transitive } from '../transitive/transitive.prerender.js';
import { VNode } from 'preact';

export function Component({ name }: { name: string }): VNode {
    return <div>
        <span>Hello to {name} from component!</span>

        {includeScript('./component.client.mjs', import.meta)}
        {inlineStyle('./component.css', import.meta)}
        <Transitive name={name} />
    </div>;
}
