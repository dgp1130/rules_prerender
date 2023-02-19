import { createAnnotation } from '../../common/models/prerender_annotation';
import { polyfillDeclarativeShadowDom } from './declarative_shadow_dom';

describe('declarative_shadow_dom', () => {
    describe('polyfillDeclarativeShadowDom()', () => {
        it('returns an annotation to include the declarative shadow DOM polyfill', () => {
            expect(polyfillDeclarativeShadowDom()).toBe(`<!-- ${createAnnotation({
                type: 'script',
                path: 'node_modules/@rules_prerender/declarative_shadow_dom/declarative_shadow_dom_polyfill',
            })} -->`);
        });
    });
});
