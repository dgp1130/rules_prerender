import { ssr } from 'rules_prerender';

export function prerenderComposed(): string {
    return `
<ul>
    <li>Composed header</li>
    ${ssr('composed')}
    <li>Composed footer</li>
</ul>
    `.trim();
}
