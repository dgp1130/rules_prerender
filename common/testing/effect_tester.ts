import 'jasmine';

import { Effect } from './effects';

/**
 * Utility class for testing effects.
 * 
 * Note: This class only supports effects using `before*()` and `after*()`
 * callbacks which do **not** use the Jasmine `done` callback. If you're using
 * `useForEach()` or `useForAll()`, then you're ok. It's only for custom-built
 * effects where this could cause an issue.
 * 
 * Example usage:
 * 
 * ```typescript
 * import 'jasmine';
 * import { Effect, useForEach } from '.../effects';
 * import { Foo } from './foo';
 * 
 * // Given an example effect:
 * function useEffect(): Effect<Foo> {
 *   return useForEach(() => {
 *     const foo = Foo.create();
 *     return [ foo, () => Foo.destroy() ];
 *   });
 * }
 * 
 * it('effect effects', async () => {
 *   const mockFoo = new Foo();
 *   spyOn(Foo, 'create').and.returnValue(mockFoo);
 *   spyOn(mockFoo, 'destroy');
 * 
 *   // Invokes the effect spies on Jasmine handlers to hook into initialization
 *   // and cleanup triggers.
 *   const tester = EffectTester.of(() => useEffect());
 * 
 *   await tester.initialize(); // Invokes initialization function.
 *   expect(Foo.create).toHaveBeenCalledOnceWith();
 *   expect(mockFoo.destroy).not.toHaveBeenCalled(); // Cleanup has not run yet.
 * 
 *   // Do something with the `Foo` `Proxy` returned by the effect.
 *   expect(() => tester.get().doSomething()).not.toThrow();
 * 
 *   await tester.cleanup(); // Invokes cleanup function (if returned).
 *   expect(mockFoo.destroy).toHaveBeenCalled();
 * });
 * ```
 */
export class EffectTester<T> {
    /** The resource managed by the effect under test. */
    private readonly effect: Effect<T>;

    /** Initializes the resource and returns its raw, unproxied value. */
    private readonly init: jasmine.ImplementationCallback;

    /** Cleans up the resource. */
    private readonly destroy?: jasmine.ImplementationCallback;

    private constructor({ effect, init, destroy }: {
        effect: Effect<T>,
        init: jasmine.ImplementationCallback,
        destroy?: jasmine.ImplementationCallback,
    }) {
        this.effect = effect;
        this.init = init;
        this.destroy = destroy;
    }

    /**
     * Creates an {@link EffectTester} from the given callback which invokes an
     * effect and returns its resource.
     * 
     * @param createEffect A function that invokes an effect function and
     *     returns its result.
     * @return An {@link EffectTester} wrapping the provided effect function.
     */
    public static of<T>(createEffect: () => Effect<T>): EffectTester<T> {
        // Watch `beforeEach()` / `beforeAll()` for the initialization function.
        let init: jasmine.ImplementationCallback | undefined;
        spyOn(globalThis, 'beforeEach').and.callFake((cb) => {
            if (init) {
                failAndThrow('Already have an effect init callback, does this'
                        + ' use `beforeEach()` **and** `beforeAll()`?');
            }
            init = cb;
        });
        spyOn(globalThis, 'beforeAll').and.callFake((cb) => {
            if (init) {
                failAndThrow('Already have an effect init callback, does this'
                        + ' use `beforeEach()` **and** `beforeAll()`?');
            }
            init = cb;
        });

        // Watch `afterEach()` / `afterAll()` for the cleanup function.
        let cleanup: jasmine.ImplementationCallback | undefined;
        spyOn(globalThis, 'afterEach').and.callFake((cb) => {
            if (cleanup) {
                failAndThrow('Already have an effect cleanup callback, does'
                        + ' this use `afterEach()` **and** `afterAll()`?');
            }
            cleanup = cb;
        });
        spyOn(globalThis, 'afterAll').and.callFake((cb) => {
            if (cleanup) {
                failAndThrow('Already have an effect cleanup callback, does'
                        + ' this use `afterEach()` **and** `afterAll()`?');
            }
            cleanup = cb;
        });

        const effect = createEffect();

        // If we don't have an initialization callback, effect is not fulfilling
        // its contract.
        if (!init) {
            failAndThrow('No init callback after executing the effect.');
        }

        return new EffectTester({
            effect,
            init,
            destroy: cleanup,
        });
    }

    /**
     * Retrieves the value held by the effect under test.
     * 
     * @return The value held by the effect under test.
     * @throws If the value is not available yet, possibly due to being
     *     requested outside of a test.
     */
    public get(): T {
        return this.effect.get();
    }

    /**
     * Invokes the initializer registered by the effect under test.
     * 
     * @return A {@link Promise} resolving to the real value returned by the
     * effect initialization, not wrapped by any {@link Proxy}.
     */
    public async initialize(): Promise<T> {
        return await this.init(done);
    }

    /**
     * Invokes the cleanup function registered by the effect under test (if
     * present).
     */
    public async cleanup(): Promise<void> {
        return await this.destroy?.(done);
    }
}

// Stub implementation of Jasmine `done()` functions. It only fails the test to
// be explicitly clear that using callbacks is not supported.
function done(): never {
    failAndThrow('EffectTester does not support `done()` callbacks in Jasmine'
            + '`before*()` / `after*()` callbacks.');
}
done.fail = (err: unknown) => {
    failAndThrow('EffectTester does not support `done()` callbacks in Jasmine'
            + '`before*()` / `after*()` callbacks. `done.fail()` callback'
            + ` invoked with: \`${JSON.stringify(err)}\`.`);
};

function failAndThrow(msg: string): never {
    fail(msg);
    throw new Error(msg);
}
