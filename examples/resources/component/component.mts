import { renderTransitive } from '../transitive/transitive.mjs';

export function renderComponent(): string {
    return `
        <div>
            <span>Hello from the component!</span>
            <img src="/images/component.png" />
        </div>
        ${renderTransitive('component')}
    `;
}
