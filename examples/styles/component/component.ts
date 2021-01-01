import { renderTransitive } from 'rules_prerender/examples/styles/transitive/transitive';

/** Renders HTML with some CSS styling. */
export function renderComponent(): string {
    return `
        <div class="component">
            <div class="label">I'm a component with some CSS!</div>
        </div>
        ${renderTransitive()}
    `;
}
