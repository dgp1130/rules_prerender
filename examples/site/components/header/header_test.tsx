import { render } from 'preact-render-to-string';
import { parse } from 'node-html-parser';
import { Header } from './header.js';

describe('header', () => {
    describe('Header()', () => {
        it('renders the header', () => {
            const fragment = parse(render(<Header />));

            // Renders a title element.
            expect(fragment.querySelector('h1')).toBeDefined();

            // Renders nav items linked to expected paths.
            const navItems = Object.fromEntries(
                fragment.querySelectorAll('nav a')
                    .map((el) => [ el.text, el.getAttribute('href') ]),
            );
            expect(navItems).toEqual({
                'Home': '/',
                'About': '/about/',
                'Counter': '/counter/',
                'Blog': '/blog/',
            });
        });
    });
});
