import { Slottable, slottable, ssr } from 'rules_prerender';
import type { ComposedSsrComponent } from 'rules_prerender/examples/ssr/composition_component/composed_ssr';

export function prerenderComposed(): Slottable<ComposedSsrComponent> {
    return slottable('composed', `
<ul>
    <li>Composed header</li>
    ${ssr('composed')}
    <li>Composed footer</li>
</ul>
    `.trim());
}
