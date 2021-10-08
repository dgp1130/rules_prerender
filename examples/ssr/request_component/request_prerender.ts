import { ssr } from 'rules_prerender';

export function prerenderRequest(): string {
    return `
<ul>
    <li>Request header</li>
    ${ssr('request')}
    <li>Request footer</li>
</ul>
    `.trim();
}
