import { includeStyle } from 'rules_prerender';

/** Renders HTML with CSS styling. */
export function renderTransitive(): string {
    return `
        <div class="transitive">
            <div class="label">I'm a transitive component with some CSS!</div>
            ${includeStyle('rules_prerender/examples/styles/transitive/transitive_styles.css')}
        </div>
    `;
}
