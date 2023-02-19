/**
 * Returns the unique `Set` of items in the given array based on the provided
 * equality comparator.
 * 
 * @param items The items to get the unique set of.
 * @param equals A function which takes two items from the input array and
 *     returns whether or not they are considered "equivalent".
 * @return A `Set` of all the unique items in the input list based on the given
 *     equality function. Of any equivalent items in the input, only the first
 *     will be included in the output.
 */
export function unique<T>(
    items: Array<T>, equals: (first: T, second: T) => boolean,
): Set<T> {
    // For each item in the input, include it only if every preceding item is
    // not equivalent. We don't need to check following items because the first
    // item of an equivalent pair is always valid to include. The second item
    // would not be included because it would be found equivalent to the first
    // item of the pair.
    return new Set(items.filter((item, index) => items.slice(0, index)
        .every((precedingItem) => !equals(item, precedingItem)),
    ));
}
