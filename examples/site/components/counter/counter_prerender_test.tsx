import { parse } from 'node-html-parser';
import { render } from 'preact-render-to-string';
import { Counter } from './counter_prerender.js';

describe('counter', () => {
    describe('Counter', () => {
        it('renders a counter', () => {
            const fragment = parse(render(
                <Counter initialValue={5} />,
                { pretty: true },
            ));

            // Should render custom element.
            const counter = fragment.querySelector('site-counter');
            expect(counter).toBeDefined();

            // Custom element light DOM should be prerendered.
            expect(counter!.querySelector('#label')!.text)
                .toBe('The current count is: 5.');
            expect(counter!.querySelector('#decrement')).toBeDefined();
            expect(counter!.querySelector('#increment')).toBeDefined();
        });
    });
});
