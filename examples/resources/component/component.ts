import { renderTransitive } from 'rules_prerender/examples/resources/transitive/transitive';

export function renderComponent(): string {
    return `
        <div>Hello from the component!</div>
        ${renderTransitive()}
    `;
}
