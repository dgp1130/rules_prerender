/**
 * A more ergonomic wrapper of the {@link Promise} API. Allows resolving and
 * rejecting a {@link Promise} without scoping the symbols.
 *
 * ```typescript
 * const delayed = new Delayed<string>();
 *
 * // Await the `Promise` somewhere.
 * delayed.promise.then(console.log, console.error);
 *
 * // Resolve or reject the `Promise` when ready.
 * delayed.resolve('Hello, World!');
 * delayed.reject(new Error('Oh noes!'));
 * ```
 */
export class Delayed<Result> {
    /** The {@link Promise} which will emit the result or an error. */
    public readonly promise: Promise<Result>;

    #resolve!: (result: Result) => void;
    #reject!: (error: unknown) => void;

    /** Constructs a new {@link Delayed}. */
    public constructor() {
        this.promise = new Promise<Result>((resolve, reject) => {
            this.#resolve = resolve;
            this.#reject = reject;
        });
    }

    /** Resolves the associated {@link Promise}. */
    public get resolve(): (result: Result) => void {
        return this.#resolve;
    }

    /** Rejects the associated {@link Promise}. */
    public get reject(): (error: unknown) => void {
        return this.#reject;
    }
}
