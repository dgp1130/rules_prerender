import 'jasmine';

import { unique } from 'rules_prerender/common/collections';

describe('collections', () => {
    describe('unique()', () => {
        it('returns the unique `Set` of input elements', () => {
            const items = [
                { value: 'foo', unrelated: 'test1' },
                { value: 'foo', unrelated: 'test2' },
                { value: 'bar', unrelated: 'test3' },
                { value: 'foo', unrelated: 'test4' },
            ];

            // Deduplicate based only on `value` and ignore `unrelated`.
            const uniq = unique(items, (l, r) => l.value === r.value);

            expect(uniq).toEqual(new Set([
                // Only the first `foo` is returned. All others are dropped.
                { value: 'foo', unrelated: 'test1' },
                { value: 'bar', unrelated: 'test3' },
            ]));
        });

        it('returns an empty `Set` when given an empty input', () => {
            expect(unique([], (l, r) => l === r)).toEqual(new Set([]));
        });
    });
});
