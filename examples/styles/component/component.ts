import { includeStyle } from 'rules_prerender';
import { renderTransitive } from 'rules_prerender/examples/styles/transitive/transitive';
import styles from 'rules_prerender/examples/styles/component/component_styles.css';
import otherStyles from 'rules_prerender/examples/styles/component/other_styles.css';

/** Renders HTML with some CSS styling. */
export function renderComponent(): string {
    return `
        <div class="${styles.component} ${otherStyles.component}">
            <div class="${styles.label} ${otherStyles.label}">I'm a component with some CSS!</div>
            ${includeStyle('rules_prerender/examples/styles/component/component_styles.module.css')}
            ${includeStyle('rules_prerender/examples/styles/component/other_styles.module.css')}
        </div>
        ${renderTransitive()}
    `;
}
