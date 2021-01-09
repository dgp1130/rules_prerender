import { polyfillDeclarativeShadowDom } from 'rules_prerender/declarative_shadow_dom';
import { inlineStyle } from 'rules_prerender';

export function renderComponent(name: string): string {
    return `
        <div id="component">
            <template shadowroot="open">
                ${polyfillDeclarativeShadowDom()}

                <span>Hello, ${name}!</span>

                ${inlineStyle('user/app/component/component.css')}
            </template>
        </div>
    `;
}
