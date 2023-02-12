import { includeScript, inlineStyle } from 'rules_prerender';
import { polyfillDeclarativeShadowDom } from '@rules_prerender/declarative_shadow_dom';

export function renderComponent(): string {
  return `
<my-component>
  <template shadowroot="open">
    <img src="/logo" />
    <div>Component</div>
    <div id="replace">This text to be replaced by JavaScript.</div>

    ${polyfillDeclarativeShadowDom()}
    ${includeScript('component/script.js')}
    ${inlineStyle('external/component/style.css')}
  </template>
</my-component>
  `.trim();
}
