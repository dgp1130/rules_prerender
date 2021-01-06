import { includeStyle } from 'rules_prerender';
import { repo } from 'rules_prerender/examples/site/links';

/** Renders a footer component for the site. */
export function renderFooter(): string {
    return `
        <div comp-footer>
            <footer>
                <span>
                    Made with
                    <a href="https://bazel.build/" rel="noopener" target="_blank">Bazel</a> and
                    <a href="${repo}" rel="noopener" target="_blank">rules_prerender</a>.
                </span>
            </footer>
            ${includeStyle('rules_prerender/examples/site/components/footer/footer.css')}
        </div>
    `;
}
