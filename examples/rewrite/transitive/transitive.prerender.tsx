import { VNode } from 'preact';

export function Transitive({ name }: { name: string }): VNode {
    return <div>
        <span>Hello to {name} from transitive component!</span>
    </div>;
}
