import { includeScript, ssr } from 'rules_prerender';

export function prerenderMixed(): string {
    return `
<ul>
    <li>SSG: Mixed</li>
    ${ssr('mixed')}
    <li id="mixed-replace">SSG: To be replaced by client-side script.</li>
    ${includeScript('rules_prerender/examples/ssr/mixed_component/mixed_client')}
</ul>
    `.trim();
}
