import { ssr } from 'rules_prerender';

export function prerenderConcurrent(): string {
    return `
<ul>
    <li>Concurrent header</li>
    ${times(10, (index) => ssr('concurrent', { index })).join('\n')}
    <li>Concurrent footer</li>
</ul>
    `.trim();
}

function times<T>(iterations: number, cb: (index: number) => T): T[] {
    const values = [] as T[];
    for (let i = 0; i < iterations; ++i) {
        values.push(cb(i));
    }
    return values;
}
