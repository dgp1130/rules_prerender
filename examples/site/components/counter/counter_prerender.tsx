import { Template, includeScript } from '@rules_prerender/preact';
import { VNode } from 'preact';

declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            'site-counter': JSX.HTMLAttributes<HTMLElement> & {
                initial?: number;
            };
        }
    }
}

/** Renders a counter with the given initial value. */
export function Counter({ initialValue }: { initialValue: number }): VNode {
    return <site-counter initial={initialValue}>
        <Template shadowrootmode="open">
            <span id="label">The current count is: {initialValue}.</span>

            {/* Render buttons disabled so they are inactive until
            JavaScript is ready to handle them. */}
            <button id="decrement" disabled>-</button>
            <button id="increment" disabled>+</button>

            {includeScript('./counter_script.mjs', import.meta)}
        </Template>
    </site-counter>;
}
