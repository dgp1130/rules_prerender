import { InlinedSvg, Template, inlineStyle } from '@rules_prerender/preact';
import { VNode } from 'preact';

/**
 * Renders the page header bar.
 *
 * @param title The title to display.
 * @part title The `h1` element containing the page title.
 */
export function Header({ title }: { title?: string }): VNode {
    return <header>
        <Template shadowrootmode="open">
            {inlineStyle('./header.css', import.meta)}

            <InlinedSvg
                id="hamburger"
                src="./hamburger.svg"
                importMeta={import.meta}
                class="icon"
            />

            {/* Only render `<h1>` when there is a title. Rendering an empty
            `<h1>` is bad for a11y. */}
            {title
                ? <h1 id="title" part="title">{title}</h1>
                : <div id="title"></div>}

            <a href="https://github.com/dgp1130/rules_prerender/"
                rel="noopener"
                id="github"
                target="_blank"
                class="icon">
                <InlinedSvg src="./github_dark.svg" importMeta={import.meta} />
            </a>
        </Template>
    </header>;
}
