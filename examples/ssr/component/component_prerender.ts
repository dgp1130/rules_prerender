import { ssr } from 'rules_prerender';

export function prerenderComponent(name: string): string {
    return `
<ul>
    <li>Foo header</li>
    ${ssr('foo', { name })}
    <li>Foo footer</li>
</ul>
    `.trim();
}
