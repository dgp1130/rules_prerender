import { includeScript } from 'rules_prerender';
import { content } from './prerender_lib.mjs';

/** Renders an example component with a script. */
export function renderComponent() {
    return `
<div id="component">${content}</div>
<div id="component-replace">
    This text to be overwritten by client-side JavaScript.
</div>
${includeScript('examples/javascript/component/component_script')}
    `.trim();
}

/**
 * Renders an example component with a script. This is never called and should
 * not be seen in the output. Used to validate tree-shaking of JS scripts.
 */
export function renderUnused() {
    return `
<div>ERROR: Should never be rendered.</div>
${includeScript('examples/javascript/component/component_script_unused')}
    `.trim();
}
