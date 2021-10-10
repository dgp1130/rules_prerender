import { ssr } from 'rules_prerender';
import { prerenderFoo } from 'rules_prerender/examples/ssr/foo_component/foo_prerender';

export function prerenderBar(): string {
    return `
<ul>
    <li>Bar header</li>
    ${prerenderFoo('Bar')}
    ${ssr('bar', undefined)}
    <li>Bar footer</li>
</ul>
    `.trim();
}
