import { renderTransitive } from 'rules_prerender/examples/styles/transitive/transitive';
import styles from 'rules_prerender/examples/styles/component/component_styles.css';

/** Renders HTML with some CSS styling. */
export function renderComponent(): string {
    return `
        <div class="${styles.component}">
            <div class="${styles.label}">I'm a component with some CSS!</div>
        </div>
        ${renderTransitive()}
    `;
}
