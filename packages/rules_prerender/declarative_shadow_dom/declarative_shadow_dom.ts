import { includeScript } from '../scripts';

/**
 * Returns a prerender annotation used by the bundler to inject the declarative
 * shadow DOM polyfill into the document.
 */
export function polyfillDeclarativeShadowDom(): string {
    return includeScript(
        'rules_prerender/packages/rules_prerender/declarative_shadow_dom/declarative_shadow_dom_polyfill');
}
