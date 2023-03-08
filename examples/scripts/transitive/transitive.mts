import { TemplateResult, html, includeScript } from '@rules_prerender/lit_engine';

/** Renders HTML which expects a JavaScript library to be included. */
export function renderTransitive(): TemplateResult {
    return html`
        <div>I'm a transitive component with some JavaScript!</div>
        <div id="transitive-replace">
            This text to be overwritten by client-side JavaScript.
        </div>
        ${includeScript('./transitive_script.mjs', import.meta)}
    `;
}
