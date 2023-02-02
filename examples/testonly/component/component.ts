import { includeScript, inlineStyle } from 'rules_prerender';
import { renderTransitive } from '../transitive/transitive';

export function renderComponent(): string {
    return `
<div>
    <template shadowroot="open">
        <span>Hello from the component!</span>
        <img src="/images/component.png" />
        <slot></slot>

        ${includeScript('examples/testonly/component/component_script')}
        ${inlineStyle('rules_prerender/examples/testonly/component/component_styles.css')}
    </template>
    ${renderTransitive()}
</div>
    `.trim();
}
