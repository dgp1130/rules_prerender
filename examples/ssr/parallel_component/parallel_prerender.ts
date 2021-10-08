import { ssr } from 'rules_prerender';

export function prerenderParallel(): string {
    return `
<ul>
    <li>Parallel header</li>
    ${times(10, (index) => ssr('parallel', { index })).join('\n')}
    <li>Parallel footer</li>
</ul>
    `;
}

function times<T>(iterations: number, cb: (index: number) => T): T[] {
    const values = [] as T[];
    for (let i = 0; i < iterations; ++i) {
        values.push(cb(i));
    }
    return values;
}
