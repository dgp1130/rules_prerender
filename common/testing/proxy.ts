import 'jasmine';

// Not `undefined` or `null`.
type Defined = string | number | boolean | symbol | object;

/**
 * Creates a {@link Proxy} object which wraps the result of the provided
 * function. The function is called only when the {@link Proxy} is accessed, so
 * the value being returned may change between invocations.
 * 
 * Example usage:
 * 
 * ```typescript
 * let foo = { bar: 'bar' };
 * const proxy = delegatedProxy(() => foo);
 * proxy.bar; // 'bar'
 * 
 * foo = { baz: 'baz' }; // foo is a completely different object!
 * proxy.baz; // 'baz'
 * ```
 * 
 * Limitations: Due to the fact that the target of the {@link Proxy} may change,
 * some features of typically {@link Proxy} objects are not totally implemented
 * here. There are three operations you should **not** perform on the
 * {@link Proxy} or a value provided by the {@param get} function:
 * 1. `new` - Construction is not supported.
 * 2. `Object.isExtensible()` - Freezing is not supported.
 * 3. `Object.freeze()` / `Object.seal()` - Freezing is not supported.
 * 
 * @param get A function which returns the target of the {@link Proxy}. The
 *     function will be called each time the {@link Proxy} is used, so this
 *     function should not mutate any state. However, the function may change
 *     its result based on external behavior.
 * @return A {@link Proxy} which proxies all accesses to the result of
 *     {@param get}.
 */
export function delegatedProxy<T extends Defined>(get: () => T): T {
    // Need a no-op target because the Proxy will dynamically retrieved the real
    // object when needed. This needs to be a Function or else `apply()` will
    // fail validation and throw an error. Fortunately, `Function` is also an
    // object so it still works with all the other possibilities.
    const target = () => {};

    const proxy = new Proxy(target, {
        get(target: {}, prop: PropertyKey, receiver?: unknown): unknown {
            const value = get() as unknown as object;
            return Reflect.get(value, prop, receiver);
        },

        set(target: {}, prop: PropertyKey, val: unknown, receiver: unknown):
                boolean {
            const value = get() as unknown as object;
            // Use `value` as the `receiver` because the real `receiver` is the
            // Proxy's original `target` function, which we don't want to
            // modify.
            return Reflect.set(value, prop, val, value);
        },

        has(target: {}, prop: PropertyKey): boolean {
            const value = get() as unknown as object;
            return Reflect.has(value, prop);
        },

        ownKeys(target: {}): Array<PropertyKey> {
            const value = get() as unknown as object;
            return Reflect.ownKeys(value);
        },

        defineProperty(
            target: {},
            prop: PropertyKey,
            attrs: PropertyDescriptor,
        ): boolean {
            const value = get() as unknown as object;
            return Reflect.defineProperty(value, prop, attrs);
        },

        getOwnPropertyDescriptor(target: {}, prop: PropertyKey):
                PropertyDescriptor | undefined {
            const value = get() as unknown as object;
            return Reflect.getOwnPropertyDescriptor(value, prop);
        },

        deleteProperty(target: {}, prop: PropertyKey): boolean {
            const value = get() as unknown as object;
            return Reflect.deleteProperty(value, prop);
        },

        apply(target: {}, self: unknown, args?: any): unknown {
            const value = get() as unknown as Function;
            return Reflect.apply(value, self, args);
        },

        getPrototypeOf(target: {}): object | null {
            const value = get() as unknown as object;
            return Reflect.getPrototypeOf(value);
        },

        setPrototypeOf(target: {}, proto: unknown): boolean {
            const value = get() as unknown as object;
            return Reflect.setPrototypeOf(value, proto);
        },
    });

    return proxy as T;
}
