import { includeScript } from 'rules_prerender';

/** Renders a counter with the given initial value. */
export function renderCounter(initialValue: number): string {
    return `
<site-counter initial="${initialValue}">
    <template shadowroot="open">
        <span id="label">The current count is: ${initialValue}.</span>

        <!-- Render buttons disabled so they are inactive until
        JavaScript is ready to handle them. -->
        <button id="decrement" disabled>-</button>
        <button id="increment" disabled>+</button>

        ${includeScript('./examples/site/components/counter/counter_script')}
    </template>
</site-counter>
    `;
}
