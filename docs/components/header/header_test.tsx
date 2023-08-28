import { render } from 'preact-render-to-string';
import { parse } from 'node-html-parser';
import { Header } from './header.js';

describe('header', () => {
    describe('Header()', () => {
        it('renders the header', () => {
            const fragment = parse(render(<Header headerTitle="Hello!" />));

            // Renders the title.
            const title = fragment.querySelector('#title');
            expect(title).not.toBeNull();
            expect(title!.textContent).toBe('Hello!');

            // Renders the hamburger icon.
            const hamburger = fragment.querySelector('#hamburger svg');
            expect(hamburger).not.toBeNull();

            // Renders the GitHub link.
            const githubLink = fragment.querySelector('#github');
            expect(githubLink).not.toBeNull();
            expect(githubLink!.getAttribute('href'))
                .toBe('https://github.com/dgp1130/rules_prerender/');
        });

        it('exposes `#title` as a part', () => {
            const fragment = parse(render(<Header headerTitle="test" />));

            // Exposes `part="title"` on the title element.
            const title = fragment.querySelector('#title');
            expect(title).not.toBeNull();
            expect(title!.getAttribute('part')).toBe('title');
        });

        it('renders an empty title when none is given', () => {
            const fragment = parse(render(<Header />));

            // Title element exists, but is empty.
            const title = fragment.querySelector('#title');
            expect(title).not.toBeNull();
            expect(title!.textContent).toBe('');

            // An empty `h1` tag is bad for accessibility, should be any other
            // element.
            expect(title!.tagName).not.toMatch(/H[1-6]/);
        });
    });
});
