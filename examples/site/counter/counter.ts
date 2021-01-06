import { baseLayout } from 'rules_prerender/examples/site/components/base/base';

/** Renders the counter page. */
export default function (): string {
    return baseLayout('Counter', () => `
        <article>
            <p>This is a basic JavaScript counter.</p>
        </article>
    `);
}
