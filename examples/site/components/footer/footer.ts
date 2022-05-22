import { inlineStyle } from 'rules_prerender';
import { repo } from 'rules_prerender/examples/site/common/links';

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
        ${inlineStyle('rules_prerender/examples/site/components/footer/footer.css')}
    </template>
</footer>
    `.trim();
}
