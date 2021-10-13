import { ssr, slottable, Slottable } from 'rules_prerender';
import { prerenderInner } from 'rules_prerender/examples/ssr/composition_component/inner_prerender';
import type { OuterSsrComponent } from 'rules_prerender/examples/ssr/composition_component/outer_ssr';

export function prerenderOuter(): Slottable<OuterSsrComponent> {
    return slottable('outer', `
<ul>
    <li>SSG: Outer component header</li>
    ${ssr('outer', {
        composed: prerenderInner(),
    })}
    <li>SSG: Outer component footer</li>
</ul>
    `.trim());
}
