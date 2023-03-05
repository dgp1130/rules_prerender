import { includeScript } from 'rules_prerender';

/**
 * Returns a prerender annotation used by the bundler to inject the declarative
 * shadow DOM polyfill into the document.
 */
export function polyfillDeclarativeShadowDom(): string {
    return includeScript('./declarative_shadow_dom_polyfill.mjs', import.meta);
}
