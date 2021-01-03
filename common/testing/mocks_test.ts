import 'jasmine';

import { unmockedFunc } from 'rules_prerender/common/testing/mocks';

describe('mocks', () => {
    describe('unmockedFunc()', () => {
        it('returns an unmocked function', () => {
            const failSpy = spyOn(globalThis, 'fail');

            const foo = unmockedFunc('foo');
            expect(fail).not.toHaveBeenCalled();

            foo('bar');
            expect(fail).toHaveBeenCalledOnceWith(jasmine.any(String));

            const msg = failSpy.calls.first().args[0];
            expect(msg).toContain('foo');
            expect(msg).toContain('bar');
        });

        // Using the same name for `unmockedFunc()` should return the same
        // function so `toEqual()` assertions of objects containing them will
        // pass.
        it('returns the same function when used multiple times with the same name', () => {
            const foo1 = unmockedFunc('foo');
            const foo2 = unmockedFunc('foo');

            expect(foo1).toBe(foo2);
        });

        it('returns different functions when used with different names', () => {
            const foo = unmockedFunc('foo');
            const bar = unmockedFunc('bar');

            expect(foo).not.toEqual(bar);
        });
    });
});
