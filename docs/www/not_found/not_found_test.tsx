import { parse } from 'node-html-parser';
import { render } from 'preact-render-to-string';
import { mockRoute } from '../../routing_mock.mjs';
import { NotFound } from './not_found.js';

const mockRoutes = [ mockRoute() ];
const mockCurrentRoute = mockRoutes[0]!;

describe('not_found', () => {
    describe('NotFound()', () => {
        it('renders a 404 not found page', () => {
            const fragment = parse(render(<NotFound
                currentRoute={mockCurrentRoute}
                routes={mockRoutes}
            />));

            const header = fragment.querySelector('main h2')!;
            expect(header.textContent).toBe('Not Found');
        });
    });
});
