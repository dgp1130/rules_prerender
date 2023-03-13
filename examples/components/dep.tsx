import { VNode } from 'preact';
import { Transitive } from './transitive.js';

export function Dep(): VNode {
    return <div class="dep">
        <span class="content">I'm a component dependency!</span>

        {/* Compose another component. */}
        <Transitive />
    </div>;
}
