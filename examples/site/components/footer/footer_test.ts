import { parse } from 'node-html-parser';
import { renderFooter } from './footer';

describe('footer', () => {
    describe('renderFooter()', () => {
        it('renders a footer', () => {
            const fragment = parse(renderFooter());

            const footerText = fragment.textContent
                .trim()
                .split('\n')
                .map((line) => line.trim())
                .join(' ');
            expect(footerText).toBe('Made with Bazel and rules_prerender.');
        });
    });
});
