import { renderTransitive } from 'rules_prerender/examples/resources/transitive/transitive';

export function renderComponent(): string {
    return `
        <div>
            <span>Hello from the component!</span>
            <img src="/images/component.png" />
        </div>
        ${renderTransitive()}
    `;
}
