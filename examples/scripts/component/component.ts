import { includeScript } from 'rules_prerender';
import { renderTransitive } from 'rules_prerender/examples/scripts/transitive/transitive';

/** Renders HTML which expects a JavaScript library to be included. */
export function renderComponent(): string {
    return `
        <div>I'm a component with some JavaScript!</div>
        <div id="component-replace">
            This text to be overwritten by client-side JavaScript.
        </div>
        ${includeScript('rules_prerender/examples/scripts/component/component_script')}
        ${renderTransitive()}
    `;
}
