import { inlineStyle } from 'rules_prerender';
import { repo } from '../../common/links.mjs';

/** Renders a footer component for the site. */
export function renderFooter(): string {
    return `
<footer>
    <template shadowroot="open">
        <div>
            Made with
            <a href="https://bazel.build/" rel="noopener" target="_blank">Bazel</a> and
            <a href="${repo}" rel="noopener" target="_blank">rules_prerender</a>.
        </div>
        ${inlineStyle('./footer.css', import.meta)}
    </template>
</footer>
    `.trim();
}
