import { includeScript, includeStyle } from 'rules_prerender';

export function renderTransitive(): string {
    return `
        <div class="transitive">
            <span class="hello">Hello from the transitive component!</span>
            <img src="/images/transitive.png" />

            ${includeScript('rules_prerender/examples/testonly/transitive/transitive_script')}
            ${includeStyle('rules_prerender/examples/testonly/transitive/transitive_styles.css')}
        </div>
    `;
}
