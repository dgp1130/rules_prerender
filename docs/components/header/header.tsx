import { inlineStyle, Template } from '@rules_prerender/preact';
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

            <div id="left-spacer"></div>

            {/* Only render `<h1>` when there is a title. Rendering an empty
            `<h1>` is bad for a11y. */}
            {title
                ? <h1 id="title" part="title">{title}</h1>
                : <div id="title"></div>}

            <a href="https://github.com/dgp1130/rules_prerender/"
                rel="noopener"
                id="github"
                target="_blank">
                <img src="/resources/header/github-dark.svg" />
            </a>
        </Template>
    </header>;
}
