import { parse } from 'node-html-parser';
import { renderToString } from 'preact-render-to-string';
import { mockRoute } from '../routing_mock.mjs';
import { IndexPage } from './index.js';

const mockRoutes = [ mockRoute() ];
const mockCurrentRoute = mockRoutes[0]!;

describe('index', () => {
    describe('IndexPage()', () => {
        it('renders the index page', () => {
            const fragment = parse(renderToString(<IndexPage
                currentRoute={mockCurrentRoute}
                routes={mockRoutes}
            />));

            expect(fragment.querySelector('h2')!.textContent).toBe('Hello, World!');
        });
    });
});
