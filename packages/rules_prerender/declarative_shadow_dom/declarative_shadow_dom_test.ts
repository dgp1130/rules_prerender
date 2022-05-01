import 'jasmine';

import { createAnnotation } from 'rules_prerender/common/models/prerender_annotation';
import { polyfillDeclarativeShadowDom } from 'rules_prerender/packages/rules_prerender/declarative_shadow_dom/declarative_shadow_dom';

describe('declarative_shadow_dom', () => {
    describe('polyfillDeclarativeShadowDom()', () => {
        it('returns an annotation to include the declarative shadow DOM polyfill', () => {
            expect(polyfillDeclarativeShadowDom()).toBe(`<!-- ${createAnnotation({
                type: 'script',
                path: 'rules_prerender/packages/rules_prerender/declarative_shadow_dom/declarative_shadow_dom_polyfill',
            })} -->`);
        });
    });
});
