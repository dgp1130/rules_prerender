import { includeScript } from 'rules_prerender';
import { renderTransitive } from '../transitive/transitive.mjs';

/** Renders HTML which expects a JavaScript library to be included. */
export function renderComponent(): string {
    return `
        <div>I'm a component with some JavaScript!</div>
        <div id="component-replace">
            This text to be overwritten by client-side JavaScript.
        </div>
        ${includeScript('examples/scripts/component/component_script.mjs')}
        ${renderTransitive()}
    `;
}
