import { serialize } from '../../common/models/prerender_annotation.mjs';
import { polyfillDeclarativeShadowDom } from './declarative_shadow_dom.mjs';

describe('declarative_shadow_dom', () => {
    describe('polyfillDeclarativeShadowDom()', () => {
        it('returns an annotation to include the declarative shadow DOM polyfill', () => {
            expect(polyfillDeclarativeShadowDom())
                .toBe(`
<rules_prerender:annotation>${
    serialize({
        type: 'script',
        path: 'packages/declarative_shadow_dom/declarative_shadow_dom_polyfill.mjs',
    })
}</rules_prerender:annotation>
                `.trim());
        });
    });
});
