import { VNode } from 'preact';
import { Transitive } from '../transitive/transitive.js';

export function Component(): VNode {
    return <div>
        <span>Hello from the component!</span>
        <img src="/images/component.png" />
        <Transitive label='component' />
    </div>;
}
