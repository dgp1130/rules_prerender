import { ssr, slottable, Slottable } from 'rules_prerender';
import { prerenderComposed } from 'rules_prerender/examples/ssr/composition_component/composed_prerender';
import type { CompositionSsrComponent } from 'rules_prerender/examples/ssr/composition_component/composition_ssr';

export function prerenderComposition(): Slottable<CompositionSsrComponent> {
    return slottable('composition', `
<ul>
    <li>Composition header</li>
    ${ssr('composition', {
        composed: prerenderComposed(),
    })}
    <li>Composition footer</li>
</ul>
    `.trim());
}
