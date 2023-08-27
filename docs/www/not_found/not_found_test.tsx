import { parse } from 'node-html-parser';
import { render } from 'preact-render-to-string';
import { NotFound } from './not_found.js';

describe('not_found', () => {
    describe('NotFound()', () => {
        it('renders a 404 not found page', () => {
            const fragment = parse(render(<NotFound routes={[]} />));

            const header = fragment.querySelector('main h2')!;
            expect(header.textContent).toBe('Not Found');
        });
    });
});
