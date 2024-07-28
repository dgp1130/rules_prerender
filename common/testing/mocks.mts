/** @fileoverview Utilities around mocking objects. */

/**
 * Returns an object type containing only the publicly available properties of
 * the input. This is useful because TypeScript interfaces include private
 * properties, which can be annoying for mocking. Using this type filters out
 * those private properties to stay consistent with the public API contract of a
 * given type.
 */
export type Public<T> = { [K in keyof T]: T[K] };

/** Holds all the unmocked functions by their name. */
const unmockedFuncs = new Map<string, () => never>();

/**
 * Returns a function to serve as a placeholder mock for an unused function.
 * Fails the test if it is ever called, because it should never actually be
 * called. Returns the same function if called multiple times with the same
 * name, that way using `expect().toEqual()` on objects with unmocked functions
 * will not fail the test.
 *
 * @param name The name of the function to use in error messaging.
 * @return A function which will fail the test if called, with an error
 *     referencing the provided name.
 */
export function unmockedFunc(name: string): (...args: unknown[]) => never {
    const fn = unmockedFuncs.get(name);
    if (fn) return fn;

    const unmocked = (...args: unknown[]): never => {
        fail(`Called unmocked function: \`${name}()\` with args:\n${
            JSON.stringify(args, null /* replacer */, 4 /* tabSize */)
        }.`);

        return undefined as never;
    };
    unmockedFuncs.set(name, unmocked);
    return unmocked;
}
