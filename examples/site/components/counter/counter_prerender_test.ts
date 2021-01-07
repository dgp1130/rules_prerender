import 'jasmine';

import { parse } from 'node-html-parser';
import { renderCounter } from 'rules_prerender/examples/site/components/counter/counter_prerender';

describe('counter', () => {
    describe('renderCounter()', () => {
        it('renders a counter', () => {
            const fragment = parse(renderCounter(5));

            // Should render custom element.
            const counter = fragment.querySelector('site-counter');
            expect(counter).toBeDefined();

            // Custom element light DOM should be prerendered.
            expect(counter.getAttribute('initial')).toBe('5');
            expect(counter.querySelector('[label]').text)
                .toBe('The current count is: 5.');
            expect(counter.querySelector('button[decrement]')).toBeDefined();
            expect(counter.querySelector('button[increment]')).toBeDefined();
        });
    });
});
