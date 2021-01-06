import { includeStyle } from 'rules_prerender';

/** Renders a footer component for the site. */
export function renderFooter(): string {
    return `
        <div comp-footer>
            <footer>
                <span>
                    Made with
                    <a href="https://bazel.build/" rel="noopener">Bazel</a> and
                    <a href="https://github.com/dgp1130/rules_prerender/" rel="noopener">rules_prerender</a>.
                </span>
            </footer>
            ${includeStyle('rules_prerender/examples/site/components/footer/footer.css')}
        </div>
    `;
}
