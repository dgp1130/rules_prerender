import { TemplateResult, html, includeScript } from '@rules_prerender/lit_engine';
import { renderTransitive } from '../transitive/transitive.mjs';

/** Renders HTML which expects a JavaScript library to be included. */
export function renderComponent(): TemplateResult {
    return html`
        <div>I'm a component with some JavaScript!</div>
        <div id="component-replace">
            This text to be overwritten by client-side JavaScript.
        </div>
        ${includeScript('./component_script.mjs', import.meta)}
        ${renderTransitive()}
    `;
}
