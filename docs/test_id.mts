/** Whether or not test IDs are enabled for the current execution. */
let testIdsEnabled = false;

/**
 * Test ID is a branded string type. This means any API which accepts strings,
 * such as Preact attributes, will support {@link TestId}. However type checking
 * will reject a raw string literal, meaning it _must_ go through a factory
 * function which creates it.
 */
export type TestId = string & { __brand: 'test-id' };

/** Enables test IDs for the current program execution. */
export function enableTestIds(): void {
    testIdsEnabled = true;
}

/**
 * Disables test IDs for the current program execution. This is an internal-only
 * utility to support testing, is not considered public API, and should _not_ be
 * used under any circumstance.
 * @testonly
 */
export function internalTestonly__disableTestIds(): void {
    testIdsEnabled = false;
}

/**
 * Creates a test ID for the given ID string if test IDs are enabled. Otherwise
 * returns `undefined`. This is a way of optionally annotating specific elements
 * which are useful for querying elements in tests, but should _not_ be marked
 * in production.
 *
 * For example, consider a component which has special behavior for the second
 * element which needs to be identified in tests.
 *
 * ```typescript
 * function MyComponent(): VNode {
 *   return <ul>
 *     <li>First</li>
 *     <li test-id={testId('second-item')}>Second</li>
 *     <li>Third</li>
 *   </ul>;
 * }
 * ```
 *
 * When generating unit tests, such as in a `_test_cases.tsx` file call
 * {@link enableTestIds}. Then, the test IDs can be leveraged in tests with:
 *
 * ```typescript
 * const ul = // ...
 * const secondLi = ul.querySelector('[test-id=second-item]');
 * ```
 *
 * However in production builds, the attribute will be missing entirely.
 *
 * ```html
 * <ul>
 *   <li>First</li>
 *   <li>Second</li>
 *   <li>Third</li>
 * </ul>
 * ```
 */
export function testId(id: string): TestId | undefined {
    if (testIdsEnabled) {
        return id as TestId;
    } else {
        return undefined;
    }
}

declare module 'preact' {
    namespace JSX {
        interface HTMLAttributes {
            /** Arbitrary attribute to identify an element for testing. */
            'test-id'?: TestId;
        }
    }
}
