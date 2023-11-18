import { Template } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { inlineStyle, InlinedSvg } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { JSX } from 'preact/jsx-runtime';

/**
 * Renders a banner informing the user that the current page is still under
 * construction.
 */
export function UnderConstructionBanner(attrs: JSX.IntrinsicElements['aside']):
        VNode {
    return <aside {...attrs}>
        <Template shadowrootmode="open">
            {inlineStyle('./under_construction_banner.css', import.meta)}

            <InlinedSvg
                src="./warning.svg"
                importMeta={import.meta}
                id="warning"
            />

            <span>
                This page is under construction. Content may be missing or
                inaccurate.
            </span>
        </Template>
    </aside>;
}
