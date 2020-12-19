/**
 * @fileoverview Provides helper utilities for constructing Jasmine effects.
 * 
 * An "effect", for lack of a better term, is a resource with self-contained
 * initialization and cleanup functionality, typically implemented via
 * {@link beforeEach} and {@link afterEach}. Using them generally looks like so:
 * 
 * ```typescript
 * describe('test suite', () => {
 *   // An "effect" representing a resource. Encapsulates initialization and
 *   // cleanup functionality so the test doesn't have to deal with it.
 *   const resource: MyResource = useSomeResource();
 * 
 *   it('uses the resource', () => {
 *     expect(() => resource.doSomething()).not.toThrow();
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

import 'jasmine';

import { delegatedProxy } from './proxy';

// Not `undefined` or `null`.
type Defined = string | number | boolean | symbol | object;

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
        init: () => MaybePromise<UseResult<T>>): T {
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
        init: () => MaybePromise<UseResult<T>>): T {
    return useValue({
        init,
        beforeFn: beforeAll,
        afterFn: afterAll,
    });
}

type MaybePromise<T> = T | Promise<T>;
type UseResult<T> = readonly [ T, (() => MaybePromise<void>) | undefined ];
function useValue<T extends Defined>({ init, beforeFn, afterFn }: {
    init: () => MaybePromise<UseResult<T>>,
    beforeFn: (cb: () => MaybePromise<void>) => void,
    afterFn: (cb: () => MaybePromise<void>) => void,
}): T {
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
    return delegatedProxy(() => {
        if (!value) {
            fail('Value not initialized or already cleaned up.');
            throw new Error('Value not initialized or already cleaned up.');
        }
        return value;
    });
}
