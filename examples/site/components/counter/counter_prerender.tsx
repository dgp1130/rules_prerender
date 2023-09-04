import { Template } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { includeScript } from '@rules_prerender/preact';
import { VNode } from 'preact';

declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            'site-counter': JSX.HTMLAttributes<HTMLElement>;
        }
    }
}

/** Renders a counter with the given initial value. */
export function Counter({ initialValue }: { initialValue: number }): VNode {
    return <site-counter>
        <Template shadowrootmode="open">
            <div id="label">The current count is: <span id="count">{initialValue}</span>.</div>

            {/* Render buttons disabled so they are inactive until
            JavaScript is ready to handle them. */}
            <button id="decrement" disabled>-</button>
            <button id="increment" disabled>+</button>

            {includeScript('./counter_script.mjs', import.meta)}
        </Template>
    </site-counter>;
}
