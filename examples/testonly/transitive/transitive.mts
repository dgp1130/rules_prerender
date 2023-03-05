import { includeScript, inlineStyle } from 'rules_prerender';

export function renderTransitive(): string {
    return `
<div>
    <template shadowroot="open">
        <span>Hello from the transitive component!</span>
        <img src="/images/transitive.png" />

        ${includeScript('./transitive_script.mjs', import.meta)}
        ${inlineStyle('rules_prerender/examples/testonly/transitive/transitive_styles.css')}
    </template>
</div>
    `;
}
