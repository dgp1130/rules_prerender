import { VNode } from 'preact';

export function Transitive(): VNode {
    return <div class="transitive">
        <span class="content">
            I'm a component which is depended upon transitively!
        </span>
    </div>;
}
