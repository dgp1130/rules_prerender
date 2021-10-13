import { includeScript, ssr } from 'rules_prerender';
import { env } from 'process';

export function prerenderMixed(): string {
    return `
<ul>
    <li>SSG: Built in Bazel workspace \`${env['BAZEL_WORKSPACE']}\`.</li>
    ${ssr('mixed')}
    <li id="mixed-replace">SSG: To be replaced by client-side script.</li>
    ${includeScript('rules_prerender/examples/ssr/mixed_component/mixed_client')}
</ul>
    `.trim();
}
