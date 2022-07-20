/**
 * @fileoverview Provides helper utilities for constructing Jasmine effects.
 * 
 * An "effect", for lack of a better term, is a resource with self-contained
 * initialization and cleanup functionality, typically implemented via
 * {@link beforeEach} and {@link afterEach}. Using them generally looks like so:
 * 
 * ```typescript
 * import { Effect } from '.../effects';
 * import { useSomeResource } from './testing/resource';
 * 
 * describe('test suite', () => {
 *   // An "effect" representing a resource. Encapsulates initialization and
 *   // cleanup functionality so the test doesn't have to deal with it.
 *   const resource: Effect<MyResource> = useSomeResource();
 * 
 *   it('uses the resource', () => {
 *     expect(() => resource.get().doSomething()).not.toThrow();
 *   });
 * });
 * ```
 * 
 * The utilities in this file aid authoring of `useSomeResource()` to provide a
 * convenient API for tests to leverage. Fundamentally, all `useSomeResource()`
 * does is make a {@link beforeEach} (or {@link beforeAll}) handler which runs
 * some initialization code with an {@link afterEach} (or {@link afterAll}) that
 * runs some cleanup code.
 * 
 * The magic trick which makes this work is that the returned value is a
 * {@link Proxy} which can exist during test setup, before Jasmine has actually
 * run the {@link beforeEach} callbacks. It proxies to the real value after
 * initialization, allowing tests to only worry about using the resource, not
 * creating it or cleaning it up.
 */

// Not `undefined` or `null`.
// eslint-disable-next-line @typescript-eslint/ban-types
type Defined = string | number | boolean | symbol | object;

/**
 * Holds a value of type T which is usable during test functions. The value may
 * be reset between tests or test suites to isolate them if appropriate. This is
 * a type-only re-export of the private implementation to avoid leaking
 * unnecessary abstraction details.
 */
export type Effect<T> = {
    /**
     * Returns an instance of the underlying value.
     * 
     * @throws If called when the value is not available, such as outside a
     *     test.
     */
    get: EffectImpl<T>['get'];
};

/**
 * Holds a value of type T which is usable during test functions. The value may
 * be reset between tests or test suites to isolate them if appropriate.
 */
class EffectImpl<T> {
    private constructor(private readonly getter: () => T) { }

    /**
     * Creates a new effect wrapping the result of the given function.
     * 
     * @param getter A function which returns the value of the effect. Will be
     *     called every time the value is retrieved and should throw if the
     *     value is not available, such as between tests.
     */
    public static of<T>(getter: () => T): EffectImpl<T> {
        return new EffectImpl(getter);
    }

    /**
     * Returns an instance of the underlying value.
     * 
     * @throws If called when the value is not available, such as outside a
     *     test.
     */
    get(): T {
        return this.getter();
    }
}

/**
 * Returns a reference to a dynamically initialized value before each test. The
 * {@param init} function is called in {@link beforeEach} with the result
 * proxied to the returned value. The cleanup function is called in
 * {@link afterEach}.
 * 
 * @param init A function which returns or resolves to an array of two values.
 *     The first is the value to be proxied and returned. The second is a
 *     cleanup function (or `undefined`) to be called in {@link afterEach}.
 * @return A proxy which wraps the the first element of the {@param init}
 *     function. This object is only valid when used inside an {@link it} and
 *     will fail the test if used when not ready.
 */
export function useForEach<T extends Defined>(
    init: () => MaybePromise<UseResult<T>>,
): Effect<T> {
    return useValue({
        init,
        beforeFn: beforeEach,
        afterFn: afterEach,
    });
}

/**
 * Returns a reference to a dynamically initialized value before each test. The
 * {@param init} function is called in {@link beforeAll} with the result
 * proxied to the returned value. The cleanup function is called in
 * {@link afterAll}.
 * 
 * @param init A function which returns or resolves to an array of two values.
 *     The first is the value to be proxied and returned. The second is a
 *     cleanup function (or `undefined`) to be called in {@link afterAll}.
 * @return A proxy which wraps the the first element of the {@param init}
 *     function. This object is only valid when used inside an {@link it} and
 *     will fail the test if used when not ready.
 */
export function useForAll<T extends Defined>(
    init: () => MaybePromise<UseResult<T>>,
): Effect<T> {
    return useValue({
        init,
        beforeFn: beforeAll,
        afterFn: afterAll,
    });
}

type MaybePromise<T> = T | Promise<T>;
type UseResult<T> = readonly [ value: T, cleanup: (() => MaybePromise<void>) | undefined ];
function useValue<T extends Defined>({ init, beforeFn, afterFn }: {
    init: () => MaybePromise<UseResult<T>>,
    beforeFn: (cb: () => MaybePromise<void>) => void,
    afterFn: (cb: () => MaybePromise<void>) => void,
}): Effect<T> {
    let value: T | undefined;
    let cleanup: (() => void | Promise<void>) | undefined;

    // Initialize the object in `beforeEach()` or `beforeAll()`.
    beforeFn(async () => {
        [ value, cleanup ] = await init();
    });

    // Clean up the object in `afterEach()` or `afterAll()`.
    afterFn(async () => {
        await cleanup?.();
        value = undefined;
    });

    // Return a proxy of the initialized value.
    return EffectImpl.of(() => {
        if (!value) {
            fail('Value not initialized or already cleaned up.');
            throw new Error('Value not initialized or already cleaned up.');
        }
        return value;
    });
}
