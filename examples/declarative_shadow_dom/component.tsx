import { ComponentChildren, VNode } from 'preact';
import { Template } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { inlineStyle } from '@rules_prerender/preact';

/** Renders an example component using Declarative Shadow DOM. */
export function Component({ children }: {
    children: ComponentChildren,
}): VNode {
    return (
        <div id="component"> {/* Host element. */}
            {/* Shadow root. */}
            <Template shadowrootmode="open">
                {/* Inline styles to apply them within this shadow root. */}
                {inlineStyle('./component.css', import.meta)}

                {/* Shadow DOM content, styled with the associated style
                sheet. */}
                <div>Shadow content</div>

                {/* Slot to insert the associated light DOM. */}
                <slot></slot>
            </Template>

            {/* Light DOM content, not affected by above style sheet. */}
            {children}
        </div>
    );
}
