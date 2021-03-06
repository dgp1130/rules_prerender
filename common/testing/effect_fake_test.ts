import 'jasmine';

import { Effect } from 'rules_prerender/common/testing/effects';
import { effectFake } from 'rules_prerender/common/testing/effect_fake';

describe('effect_fake', () => {
    describe('effectFake()', () => {
        it('fakes an effect', () => {
            const effect = effectFake('foo');

            expect(effect.get()).toBe('foo');
        });

        it('is assignable to an effect', () => {
            const fake = effectFake('foo');

            // Expect to be assignable in types.
            const effect: Effect<string> = fake;

            expect().nothing();
        });
    });
});
