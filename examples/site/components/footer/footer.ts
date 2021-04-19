import { repo } from 'rules_prerender/examples/site/common/links';
import styles from 'rules_prerender/examples/site/components/footer/footer.css';

/** Renders a footer component for the site. */
export function renderFooter(): string {
    return `
        <div class="${styles.container}">
            <footer class="${styles.footer}">
                <span>
                    Made with
                    <a href="https://bazel.build/" rel="noopener" target="_blank">Bazel</a> and
                    <a href="${repo}" rel="noopener" target="_blank">rules_prerender</a>.
                </span>
            </footer>
        </div>
    `;
}
