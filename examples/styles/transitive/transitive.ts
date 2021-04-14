import { includeStyle } from 'rules_prerender';
import styles from './transitive_styles.css';

/** Renders HTML with CSS styling. */
export function renderTransitive(): string {
    return `
        <div class="${styles.transitive}">
            <div class="${styles.label}">I'm a transitive component with some CSS!</div>
            ${includeStyle('rules_prerender/examples/styles/transitive/transitive_styles.module.css')}
        </div>
    `;
}
