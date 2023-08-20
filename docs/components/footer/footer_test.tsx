import { render } from 'preact-render-to-string';
import { parse } from 'node-html-parser';
import { Footer } from './footer.js';

describe('footer', () => {
    describe('Footer()', () => {
        it('renders the footer', () => {
            const fragment = parse(render(<Footer />));

            const items =
                fragment.querySelectorAll('li').map((el) => el.textContent);
            expect(items).toEqual([
                'GitHub',
                'Copyright rules_prerender 2023',
                'Privacy Policy',
            ]);
        });
    });
});
