import 'jasmine';

import { Effect } from './effects';
import { effectFake } from './effect_fake';

describe('effect_fake', () => {
    describe('effectFake()', () => {
        it('fakes an effect', () => {
            const effect = effectFake('foo');

            expect(effect.get()).toBe('foo');
        });

        it('is assignable to an effect', () => {
            const fake = effectFake('foo');

            // Expect to be assignable in types.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const effect: Effect<string> = fake;

            expect().nothing();
        });
    });
});
