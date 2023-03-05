import { includeScript, inlineStyle } from 'rules_prerender';
import { polyfillDeclarativeShadowDom } from '@rules_prerender/declarative_shadow_dom';

export function renderComponent(): string {
  return `
<my-component>
  <template shadowroot="open">
    <img src="/logo" />
    <span>Component</span>
    <div id="replace">This text to be replaced by JavaScript.</div>

    ${polyfillDeclarativeShadowDom()}
    ${includeScript('./script.mjs', import.meta)}
    ${inlineStyle('external/component/style.css')}
  </template>
</my-component>
  `.trim();
}
