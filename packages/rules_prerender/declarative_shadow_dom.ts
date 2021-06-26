import { includeScript } from 'rules_prerender';

/** TODO: Document. */
export function polyfillDeclarativeShadowDom(): string {
    return includeScript('rules_prerender/packages/rules_prerender/declarative_shadow_dom_polyfill');
}
