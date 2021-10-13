import { includeScript, ssr } from 'rules_prerender';
import { env } from 'process';

export function prerenderMixed(): string {
    return `
<ul>
    <!-- Include SSG, SSR, and CSR in the same example. -->
    <li>SSG: Built in Bazel workspace \`${env['BAZEL_WORKSPACE']}\`.</li>
    ${ssr('mixed')}
    <li class="mixed-replace">SSG: To be replaced by client-side script.</li>

    <!-- Repeat the content just to show that any order is possible. -->
    <li>SSG: Built in Bazel workspace \`${env['BAZEL_WORKSPACE']}\`.</li>
    ${ssr('mixed')}
    <li class="mixed-replace">SSG: To be replaced by client-side script.</li>

    ${includeScript('rules_prerender/examples/ssr/mixed_component/mixed_client')}
</ul>
    `.trim();
}
