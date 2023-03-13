import { VNode } from 'preact';

export function Transitive({ label }: { label: string }): VNode {
    return <div>
        <span>Hello from the {label} transitive component!</span>
        <img src="/images/transitive.png" />
    </div>;
}
