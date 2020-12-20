import { render as renderTransitive } from './transitive';

export function render(): string {
    return `
        <div class="dep">
            <span class="content">I'm a component dependency!</span>

            <!-- Compose another component. -->
            ${renderTransitive()}
        </div>
    `;
}
