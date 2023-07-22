import { includeScript } from '@rules_prerender/preact';
import { h } from 'preact';

/** Renders an example component with a script. */
export function Component() {
    return h('', {}, [
        h('div', { id: 'component-replace' }, [
            'This text to be overwritten by client-side JavaScript.',
        ]),
        includeScript('./component_script.mjs', import.meta),
    ]);
}

/**
 * Renders an example component with a script. This is never called and should
 * not be seen in the output. Used to validate tree-shaking of JS scripts.
 */
export function Unused() {
    return h('', {}, [
        h('div', {}, [ 'ERROR: Should never be rendered.' ]),
        includeScript('./component_script_unused.mjs', import.meta),
    ]);
}
