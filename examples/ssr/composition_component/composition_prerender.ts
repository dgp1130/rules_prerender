import { ssr } from 'rules_prerender';
import { prerenderComposed } from 'rules_prerender/examples/ssr/composition_component/composed_prerender';

export function prerenderComposition(): string {
    return `
<ul>
    <li>Composition header</li>
    ${ssr('composition', {
        composed: prerenderComposed(),
    })}
    <li>Composition footer</li>
</ul>
    `.trim();
}
