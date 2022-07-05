import { Effect } from './effects';

/**
 * Creates a fake implementation of an {@link Effect} which holds the provided
 * value.
 * 
 * @param value The value to wrap in an {@link Effect}.
 * @return A fake implementation of an {@link Effect} which provides the given
 *     value.
 */
export function effectFake<T>(value: T): Effect<T> {
    return {
        get: () => value,
    };
}
