import { includeScript } from 'rules_prerender';

/** Renders a counter with the given initial value. */
export function renderCounter(initialValue: number): string {
    return `
        <div comp-counter>
            <site-counter initial="${initialValue}">
                <span label>The current count is: ${initialValue}.</span>

                <!-- Render buttons disabled so they are inactive until
                JavaScript is ready to handle them. -->
                <button decrement disabled>-</button>
                <button increment disabled>+</button>
            </site-counter>

            ${includeScript('rules_prerender/examples/site/components/counter/counter_script')}
        </div>
    `;
}
