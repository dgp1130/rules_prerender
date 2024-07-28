import { Delayed } from './delayed.mjs';

/**
 * A data class which provides an {@link ImperativeIterator} as well as the
 * associated {@link AsyncIterable}.
 */
export class ImperativeIteratorFactory<Item> {
    public constructor(
        /**
         * A {@link Promise} which resolves to an {@link ImperativeIterator}
         * when the iterator is first polled by a consumer.
         */
        public readonly started: Promise<ImperativeIterator<Item>>,

        /**
         * A {@link AsyncIterable} which iterates over values provided by the
         * associated {@link ImperativeIterator}.
         */
        public readonly iterable: AsyncIterable<Item>,
    ) {}
}

/**
 * Provides an iterator which can be easily manipulated to emit values
 * imperatively. This can be more ergonomic than a generator in some code
 * contexts.
 *
 * ```typescript
 * const factory = ImperativeIterator.factory() as
 *     ImperativeIteratorFactory<string>;
 *
 * (async () => {
 *   // Wait for the iterator to polled at least once.
 *   const imperativeIterator = await factory.started;
 *
 *   // Send data to it.
 *   const readyForNext = iterator.emit('test'); // Emit a value.
 *   await readyForNext; // Wait until `next` is called a second time.
 *   iterator.error(new Error('Oh noes!')); // Emit an error.
 *   iterator.done(); // Done emitting values.
 * })();
 *
 * // Iterate over the iterable like any other.
 * for await (const value of factory.iterable) {
 *   console.log(value);
 * }
 * ```
 */
export class ImperativeIterator<Item> implements AsyncIterator<Item> {
    private queue: Array<IteratorResult<Item> | IteratorErrorResult> = [];
    private delayed?: Delayed<IteratorResult<Item>>;

    private readonly start = new Delayed<void>();
    private polled = new Delayed<void>();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    /**
     * Creates an {@link ImperativeIteratorFactory}. `await` the `started`
     * property to get an instance to the actual {@link ImperativeIterator} and
     * produce values. Iterate over the `iterable` property to consume those
     * values.
     *
     * This is a return-only generic, so cast the result into the
     * {@link ImperativeIteratorFactory} of your preferred type.
     */
    public static factory(): ImperativeIteratorFactory<unknown> {
        const iterator = new ImperativeIterator<unknown>();
        return new ImperativeIteratorFactory<unknown>(
            iterator.start.promise.then(() => iterator),
            iterator.iterable,
        );
    }

    /**
     * Emits the given value as the next result.
     *
     * @returns {@link Promise} which resolves when the iterator is polled for a
     *     new value.
     */
    public emit(item: Item): Promise<void> {
        this.push({ value: item, done: false });

        return this.polled.promise;
    }

    /** Emits the given value as an error. */
    public error(err: unknown): void {
        this.push({ value: err, error: true });
    }

    /** Emits a "done" signal. */
    public done(): void {
        this.push({ value: undefined, done: true });
    }

    /**
     * Push the result to a pending {@link Promise} or queue it for a future
     * {@link Promise}.
     */
    private push(result: IteratorResult<Item> | IteratorErrorResult): void {
        if (this.delayed) {
            // "Push" the value to an existing, waiting `next()` call.
            const delayed = this.delayed;
            this.delayed = undefined;

            if (this.isErrorResult(result)) {
                delayed.reject(result.value);
            } else {
                delayed.resolve(result);
            }

            // Track error and done events in the queue where they will remain
            // for future requests.
            if (this.isErrorResult(result) || this.isDoneResult(result)) {
                this.queue.push(result);
            }
        } else {
            // Don't store any data if we're already done, as we will never emit
            // it and it would be a waste of memory.
            if (this.isComplete()) return;

            // Store the value on the queue for a future `next()` call.
            this.queue.push(result);
        }
    }

    /**
     * Whether or not the iterator is complete from a `done` or `error` call.
     */
    private isComplete(): boolean {
        // We stop adding items to the queue once `done` is called. Therefore we
        // can know if we're done, based on whether the last item in the queue
        // is a `done` result, because nothing else will be added after that.
        const last = this.queue.length === 0
            ? undefined
            : this.queue[this.queue.length - 1];

        if (!last) return false; // Nothing in the queue, will continue.
        if (this.isDoneResult(last)) return true; // Called `done`.
        if (this.isErrorResult(last)) return true; // Called `error`.
        return false; // Must be a value, will continue.
    }

    private isValueResult(result: IteratorResult<Item> | IteratorErrorResult):
            result is IteratorYieldResult<Item> {
        return !this.isDoneResult(result) && !this.isErrorResult(result);
    }

    private isDoneResult(result: IteratorResult<Item> | IteratorErrorResult):
            result is IteratorReturnResult<Item> {
        return !!('done' in result && result.done);
    }

    private isErrorResult(result: IteratorResult<Item> | IteratorErrorResult):
            result is IteratorErrorResult {
        return 'error' in result && result.error;
    }

    public get iterable(): AsyncIterable<Item> {
        return {
            [Symbol.asyncIterator]: (): this => {
                return this;
            }
        };
    }

    next(): Promise<IteratorResult<Item, void>> {
        // Start pulling values from the iterable.
        this.start.resolve();

        // Resolve `Promise` values waiting on the next poll.
        this.polled.resolve();
        this.polled = new Delayed<void>();

        const first = this.queue.length > 0 ? this.queue[0] : undefined;
        if (first) {
            // Remove value results from the queue. We leave error and done
            // results because those will be repeated on subsequent `next`
            // calls.
            if (this.isValueResult(first)) {
                this.queue.shift();
            }

            if (this.isErrorResult(first)) {
                // This is just propagating the provided error value and should
                // match the exact semantics of an iterator.
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                return Promise.reject(first.value);
            } else {
                return Promise.resolve(first);
            }
        }

        this.delayed ??= new Delayed();
        return this.delayed.promise;
    }
}

interface IteratorErrorResult {
    value: unknown;
    error: true;
}
