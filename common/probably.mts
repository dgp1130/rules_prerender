/**
 * Represents a value which is "probably" of type `T`. Doesn't actually contain
 * any of the properties of `T` because we aren't sure they exist.
 */
export interface Probably<T> {
    readonly __probably__?: T;

    // With `noPropertyAccessOnIndexSignature`, dot property access always
    // fails, but indexed access still works, so the type can be safely queried.
    [prop: string]: unknown;
}

/**
 * Converts a `Probably<T>` back into a `T` because it is _definitely_ the
 * right type after assertion.
 */
export type Definitely<P extends Probably<unknown>> =
        P extends Probably<infer T> ? T : never;

/**
 * Converts a `Probably<T>` into its `T` value. This is effectively an
 * assertion by the developer (not validated at runtime) that the value is
 * of type `T`.
 */
export function definitely<T>(probably: Probably<T>): T {
    return probably as unknown as T;
}
