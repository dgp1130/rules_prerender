import { inlineStyle } from 'rules_prerender';
import { renderTransitive } from 'rules_prerender/examples/styles/transitive/transitive';

/** Renders HTML with some CSS styling. */
export function renderComponent(): string {
    return `
<div class="component">
    <template shadowroot="open">
        <div>I'm a component with some CSS!</div>
        <slot></slot>

        ${inlineStyle('rules_prerender/examples/styles/component/component_styles.css')}
    </template>
    ${renderTransitive()}
</div>
    `;
}
