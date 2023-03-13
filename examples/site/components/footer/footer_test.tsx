import { parse } from 'node-html-parser';
import { render } from 'preact-render-to-string';
import { Footer } from './footer.js';

describe('footer', () => {
    describe('Footer()', () => {
        it('renders a footer', () => {
            const fragment = parse(render(<Footer />));

            const footerText = fragment.textContent
                .trim()
                .split('\n')
                .map((line) => line.trim())
                .join(' ');
            expect(footerText)
                .toContain('Made with Bazel and rules_prerender.');
        });
    });
});
