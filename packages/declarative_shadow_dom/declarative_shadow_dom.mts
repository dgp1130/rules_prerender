import { includeScript } from 'rules_prerender';

/**
 * Returns a prerender annotation used by the bundler to inject the declarative
 * shadow DOM polyfill into the document.
 */
export function polyfillDeclarativeShadowDom(): string {
    // TODO: Can't use the prerender component directly, _need_ to go through
    // `link_prerender_component()`.
    return includeScript(
        'node_modules/@rules_prerender/declarative_shadow_dom/declarative_shadow_dom_polyfill.mjs');
}
