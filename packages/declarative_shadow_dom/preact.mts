import { includeScript } from '@rules_prerender/preact';
import type { VNode } from 'preact';

/**
 * Returns a prerender annotation used by the bundler to inject the declarative
 * shadow DOM polyfill into the document.
 */
export function polyfillDeclarativeShadowDom(): VNode {
    return includeScript('./declarative_shadow_dom_polyfill.mjs', import.meta);
}
