import { renderTransitive } from 'rules_prerender/examples/javascript/transitive/transitive';

/** Renders HTML which expects a JavaScript library to be included. */
export function renderComponent(): string {
    return `
        <div>I'm a component with some JavaScript!</div>
        <div id="component-replace">
            This text to be overwritten by client-side JavaScript.
        </div>
        ${renderTransitive()}
    `;
}
