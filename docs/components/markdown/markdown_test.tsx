import { render } from 'preact-render-to-string';
import { safe } from 'rules_prerender';
import { Markdown } from './markdown.js';
import { mockMarkdownPage } from '../../markdown/markdown_page_mock.mjs';
import { mockRoute } from '../../routing_mock.mjs';

const mockRoutes = [ mockRoute() ];
const mockCurrentRoute = mockRoutes[0]!;

describe('markdown', () => {
    describe('Markdown', () => {
        it('renders the given markdown page', () => {
            const md = mockMarkdownPage({
                metadata: { title: 'My title' },
                html: safe`<div>Hello, World!</div>`,
            });
            const page = <Markdown
                page={md}
                currentRoute={mockCurrentRoute}
                routes={mockRoutes}
            />;

            const html = render(page);
            expect(html).toContain('My title');
            expect(html).toContain('<div>Hello, World!</div>');
        });
    });
});
