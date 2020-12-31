import 'jasmine';

import { useForEach } from 'rules_prerender/common/testing/effects';
import { EffectTester } from 'rules_prerender/common/testing/effect_tester';

describe('EffectTester', () => {
    it('tests effects', async () => {
        const resource = { foo: 'bar' };
        const cleanup = jasmine.createSpy('cleanup');
        const init = jasmine.createSpy(
                'init', () => [ resource, cleanup ] as const).and.callThrough();
        
        // Create the effect, should not initialize yet.
        const tester = EffectTester.of(() => useForEach(init));
        expect(init).not.toHaveBeenCalled();

        // Initialize the effect, should not clean up yet.
        await tester.initialize();
        expect(init).toHaveBeenCalled();
        expect(cleanup).not.toHaveBeenCalled();

        // Use the resource of the effect.
        expect(tester.get().foo).toBe('bar');

        // Clean up the effect.
        await tester.cleanup();
        expect(cleanup).toHaveBeenCalled();
    });

    it('tests effects without a cleanup function', async () => {
        const resource = { foo: 'bar' };
        const init = jasmine.createSpy(
            'init',
            () => [ resource, undefined ] as const,
        ).and.callThrough();
        
        // Create the effect, should not initialize yet.
        const tester = EffectTester.of(() => useForEach(init));
        expect(init).not.toHaveBeenCalled();

        // Initialize the effect.
        await tester.initialize();
        expect(init).toHaveBeenCalled();

        // Use the resource of the effect.
        expect(tester.get().foo).toBe('bar');

        // Clean up the effect, should be a no-op.
        await expectAsync(tester.cleanup()).toBeResolved();
    });

    it('fails when given an effect that registers two before callbacks', () => {
        const failSpy = spyOn(globalThis, 'fail');

        expect(() => EffectTester.of(() => {
            // Multiples calls to `before*()` callbacks.
            beforeEach(() => {});
            beforeAll(() => {});
            return { get: () => 'foo' };
        })).toThrowError(/Already have an effect init callback/);

        expect(failSpy).toHaveBeenCalled();
        expect(failSpy.calls.first().args[0])
                .toContain('Already have an effect init callback');
    });

    it('fails when given an effect that registers two after callbacks', () => {
        const failSpy = spyOn(globalThis, 'fail');

        expect(() => EffectTester.of(() => {
            // One required call to `before*()`.
            beforeEach(() => {});

            // Multiples calls to `after*()` callbacks.
            afterEach(() => {});
            afterAll(() => {});

            return { get: () => 'foo' };
        })).toThrowError(/Already have an effect cleanup callback/);

        expect(failSpy).toHaveBeenCalled();
        expect(failSpy.calls.first().args[0])
                .toContain('Already have an effect cleanup callback');
    });

    it('fails when given an effect that does not register a before callback', () => {
        const failSpy = spyOn(globalThis, 'fail');

        expect(() => EffectTester.of(() => {
            // No calls to `before*()`.
            return { get: () => 'foo' };
        })).toThrowError(/No init callback/);

        expect(failSpy).toHaveBeenCalledTimes(1);
        expect(failSpy.calls.first().args[0]).toContain('No init callback');
    });

    it('fails when an effect invokes a `done()` callback', async () => {
        const failSpy = spyOn(globalThis, 'fail');

        const tester = EffectTester.of(() => {
            beforeEach((done) => {
                done(); // Calls unsupported `done()`.
            });

            return { get: () => 'foo' };
        });

        await expectAsync(tester.initialize()).toBeRejectedWithError(
                /EffectTester does not support `done\(\)` callbacks/);

        expect(failSpy).toHaveBeenCalledTimes(1);
        expect(failSpy.calls.first().args[0])
                .toContain('EffectTester does not support `done()` callbacks');
    });
});
