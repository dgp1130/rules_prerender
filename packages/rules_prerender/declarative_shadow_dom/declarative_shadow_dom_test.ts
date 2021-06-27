import 'jasmine';
import { polyfillDeclarativeShadowDom } from 'rules_prerender/packages/rules_prerender/declarative_shadow_dom/declarative_shadow_dom';

describe('declarative_shadow_dom', () => {
    describe('polyfillDeclarativeShadowDom()', () => {
        it('returns an annotation to include the declarative shadow DOM polyfill', () => {
            expect(polyfillDeclarativeShadowDom())
                .toBe('<!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"script","path":"rules_prerender/packages/rules_prerender/declarative_shadow_dom/declarative_shadow_dom_polyfill"} -->');
        });
    });
});
