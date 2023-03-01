import { parse } from 'node-html-parser';
import { renderCounter } from './counter_prerender.mjs';

describe('counter', () => {
    describe('renderCounter()', () => {
        it('renders a counter', () => {
            const fragment = parse(renderCounter(5));

            // Should render custom element.
            const counter = fragment.querySelector('site-counter');
            expect(counter).toBeDefined();

            // Custom element light DOM should be prerendered.
            expect(counter!.getAttribute('initial')).toBe('5');
            expect(counter!.querySelector('#label')!.text)
                .toBe('The current count is: 5.');
            expect(counter!.querySelector('#decrement')).toBeDefined();
            expect(counter!.querySelector('#increment')).toBeDefined();
        });
    });
});
