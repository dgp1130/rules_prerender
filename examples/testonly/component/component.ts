import { includeScript, includeStyle } from 'rules_prerender';
import { renderTransitive } from 'rules_prerender/examples/testonly/transitive/transitive';

export function renderComponent(): string {
    return `
        <div class="component">
            <span class="hello">Hello from the component!</span>
            <img src="/images/component.png" />

            ${renderTransitive()}

            ${includeScript('rules_prerender/examples/testonly/component/component_script')}
            ${includeStyle('rules_prerender/examples/testonly/component/component_styles.css')}
        </div>
    `;
}
