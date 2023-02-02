import { includeScript } from 'rules_prerender';

/** Renders HTML which expects a JavaScript library to be included. */
export function renderTransitive(): string {
    return `
        <div>I'm a transitive component with some JavaScript!</div>
        <div id="transitive-replace">
            This text to be overwritten by client-side JavaScript.
        </div>
        ${includeScript('examples/scripts/transitive/transitive_script')}
    `;
}
