import { inlineStyle } from 'rules_prerender';
import { polyfillDeclarativeShadowDom } from 'rules_prerender/declarative_shadow_dom';

/** Renders an example component using Declarative Shadow DOM. */
export function renderComponent(lightDom: string): string {
    return `
        <!-- Host element. -->
        <div id="component">
            <!-- Shadow root. -->
            <template shadowroot="open">
                <!-- Polyfill declarative shadow DOM for browsers that don't
                support it yet. -->
                ${polyfillDeclarativeShadowDom()}

                <!-- Inline styles to apply them within this shadow root. -->
                ${inlineStyle('rules_prerender/examples/declarative_shadow_dom/component.css')}

                <!-- Shadow DOM content, styled with the associated style
                sheet. -->
                <div>Shadow content</div>

                <!-- Slot to insert the associated light DOM. -->
                <slot></slot>
            </template>

            <!-- Light DOM content, not affected by above style sheet. -->
            ${lightDom}
        </div>
    `;
}
