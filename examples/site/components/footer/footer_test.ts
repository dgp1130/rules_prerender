import { parse } from 'node-html-parser';
import { renderFooter } from './footer';

describe('footer', () => {
    describe('renderFooter()', () => {
        it('renders a footer', () => {
            const fragment = parse(renderFooter());

            expect(fragment.structuredText)
                .toContain('Made with Bazel and rules_prerender.');
        });
    });
});
