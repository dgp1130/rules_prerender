import { Slottable, slottable, ssr } from 'rules_prerender';
import type { InnerSsrComponent } from 'rules_prerender/examples/ssr/composition_component/inner_ssr';

export function prerenderInner(): Slottable<InnerSsrComponent> {
    return slottable('inner', `
<ul>
    <li>SSG: Inner component header</li>
    ${ssr('inner')}
    <li>SSG: Inner component footer</li>
</ul>
    `.trim());
}
