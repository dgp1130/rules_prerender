import { includeScript, inlineStyle } from 'rules_prerender';

export function renderTransitive(): string {
    return `
<div>
    <template shadowroot="open">
        <span>Hello from the transitive component!</span>
        <img src="/images/transitive.png" />

        ${includeScript('./transitive_script.mjs', import.meta)}
        ${inlineStyle('./transitive_styles.css', import.meta)}
    </template>
</div>
    `;
}
