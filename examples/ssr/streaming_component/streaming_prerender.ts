import { ssr } from 'rules_prerender';

export function prerenderStreaming(): string {
    return `
<ul>
    <li>Streaming header</li>
    ${ssr('streaming')}
    <li>Streaming footer</li>
</ul>
    `.trim();
}
