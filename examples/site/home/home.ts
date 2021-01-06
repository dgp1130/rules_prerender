import { baseLayout } from 'rules_prerender/examples/site/components/base/base';

export default function (): string {
    return baseLayout('Home', () => `
        <h2>Home</h2>
    `);
}
