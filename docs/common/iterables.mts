import { ImperativeIterator, ImperativeIteratorFactory } from './imperative_iterator.mjs';

/**
 * Runs the given async iterables in parallel and merges the results in the
 * order they are emitted.
 *
 * @param iterables Iterables to parallelize.
 * @returns A single iterable which emits all the values of the provided
 *     iterables in the order they are each emitted.
 */
export function parallel<Item>(...iterables: Array<AsyncIterable<Item>>):
        AsyncIterable<Item> {
    // Return an empty iterable if nothing to parallelize. Otherwise this
    // function will stall forever in that case.
    if (!iterables.length) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return (async function* (): AsyncGenerator<never, void, void> {})();
    }

    // Create an iterator and wait for it to be started via a poll.
    const iteratorFactory = ImperativeIterator.factory() as
        ImperativeIteratorFactory<Item>;

    // Consume each iterable asynchronously in a background task.
    let count = 0;
    for (const iterable of iterables) {
        (async () => {
            const imperativeIterator = await iteratorFactory.started;
            try {
                for await (const item of iterable) {
                    imperativeIterator.emit(item);
                }
            } catch (err) {
                imperativeIterator.error(err);
                return;
            }

            // Done once all the generates have fully emitted.
            count++;
            if (count >= iterables.length) {
                imperativeIterator.done();
            }
        })();
    }

    return iteratorFactory.iterable;
}
