import { Template } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { InlinedSvg, includeScript, inlineStyle, CustomElement } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { JSX } from 'preact/jsx-runtime';

/**
 * Renders the page header bar.
 *
 * @param headerTitle The title to display.
 * @part title The `h1` element containing the page title.
 */
export function Header({ headerTitle, ...attrs }:
    { headerTitle?: string } & JSX.IntrinsicElements['rp-header'],
): VNode {
    // `<rp-header>` uses `role="banner"` to align with `<header>`.
    return <rp-header role="banner" {...attrs}>
        <Template shadowrootmode="open">
            {inlineStyle('./header.css', import.meta)}
            {includeScript('./header_script.mjs', import.meta)}

            <button id="hamburger" class="icon">
                <InlinedSvg src="./hamburger.svg" importMeta={import.meta} />
            </button>

            {/* Only render `<h1>` when there is a title. Rendering an empty
            `<h1>` is bad for a11y. */}
            {headerTitle
                ? <h1 id="title" part="title">{headerTitle}</h1>
                : <div id="title"></div>}

            <a href="https://github.com/dgp1130/rules_prerender/"
                rel="noopener"
                id="github"
                target="_blank"
                class="icon">
                <InlinedSvg src="./github_dark.svg" importMeta={import.meta} />
            </a>
        </Template>
    </rp-header>;
}

declare module 'preact' {
    namespace JSX {
        interface IntrinsicElements {
            'rp-header': JSX.HTMLAttributes<CustomElement>;
        }
    }
}
