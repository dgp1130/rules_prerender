import { parse } from 'node-html-parser';
import { renderHeader } from './header';

describe('header', () => {
    describe('renderHeader()', () => {
        it('renders the header', () => {
            const fragment = parse(renderHeader());

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
