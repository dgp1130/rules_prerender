import { inlineStyle } from 'rules_prerender';

/** Renders HTML with CSS styling. */
export function renderTransitive(): string {
    return `
<div class="transitive">
    <template shadowroot="open">
        <div>I'm a transitive component with some CSS!</div>

        ${inlineStyle('rules_prerender/examples/styles/transitive/transitive_styles.css')}
    </template>
</div>
    `;
}
