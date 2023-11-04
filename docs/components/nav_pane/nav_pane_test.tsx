import { render } from 'preact-render-to-string';
import { HTMLElement, parse } from 'node-html-parser';
import { NavPane } from './nav_pane.js';
import { mockRoute } from '../../routing_mock.mjs';

describe('nav_pane', () => {
    describe('NavPane()', () => {
        it('renders a flat navigation hierarchy', () => {
            const routes = [
                mockRoute({ label: 'Home', path: '/' }),
                mockRoute({ label: 'About', path: '/about/' }),
                mockRoute({ label: 'Contact', path: '/contact/' }),
            ];
            const currentRoute = routes[0]!;

            const fragment = parse(render(<NavPane
                currentRoute={currentRoute}
                routes={routes}
            />));

            // Renders the custom element.
            const root = fragment.firstChild as HTMLElement;
            expect(root).not.toBeNull();
            expect(root.tagName).toBe('RP-NAV-PANE');

            // Renders the list of routes in order.
            const navItems = root.querySelectorAll('a');
            expect(navItems.map((el) => el.textContent))
                .toEqual([ 'Home', 'About', 'Contact' ]);
            expect(navItems.map((el) => el.getAttribute('href')))
                .toEqual([ '/', '/about/', '/contact/' ]);
        });

        it('renders a nested hierarchy', () => {
            const routes = [
                mockRoute({
                    label: 'Root',
                    children: [
                        mockRoute({ label: 'First', path: '/first/' }),
                        mockRoute({ label: 'Second', path: '/second/' }),
                    ],
                }),
            ];
            const currentRoute = routes[0]!;

            const fragment = parse(render(<NavPane
                currentRoute={currentRoute}
                routes={routes}
            />));
            expect(fragment).not.toBeNull();

            // Renders the root element at depth 0.
            const rootItems = fragment.querySelectorAll('li:has(.depth-0)');
            expect(rootItems.length).toBe(1);
            const root = rootItems[0]!;
            expect(root.querySelector('.list-el')!.textContent).toBe('Root');

            // Renders first and second at depth 1.
            const rootChildren = root.querySelectorAll('li:has(.depth-1)');
            expect(rootChildren.length).toBe(2);
            const first = rootChildren[0]!;
            expect(first.textContent).toBe('First');
            const second = rootChildren[1]!;
            expect(second.textContent).toBe('Second');
        });

        it('throws an error when given no routes', () => {
            expect(() => render(<NavPane
                currentRoute={mockRoute()}
                routes={[]}
            />)).toThrowError(/Must provide at least one route/);
        });
    });
});
