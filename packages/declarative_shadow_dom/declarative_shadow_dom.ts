import { includeScript } from 'rules_prerender';
import { unique } from '@rules_prerender/collections';

/**
 * Returns a prerender annotation used by the bundler to inject the declarative
 * shadow DOM polyfill into the document.
 */
export function polyfillDeclarativeShadowDom(): string {
    // DEBUG
    console.error(unique([1, 2, 1], (first, second) => first === second));

    // TODO: Can't use the prerender component directly, _need_ to go through
    // `link_prerender_component()`.
    return includeScript(
        'node_modules/@rules_prerender/declarative_shadow_dom/declarative_shadow_dom_polyfill');
}
