import { includeScript, inlineStyle } from 'rules_prerender';
import { renderTransitive } from '../transitive/transitive.mjs';

export function renderComponent(): string {
    return `
<div>
    <template shadowroot="open">
        <span>Hello from the component!</span>
        <img src="/images/component.png" />
        <slot></slot>

        ${includeScript('./component_script.mjs', import.meta)}
        ${inlineStyle('./component_styles.css', import.meta)}
    </template>
    ${renderTransitive()}
</div>
    `.trim();
}
