import { render } from 'preact-render-to-string';
import { HTMLElement, parse } from 'node-html-parser';
import { Layout } from './layout.js';

describe('layout', () => {
    describe('Layout()', () => {
        it('renders the default layout', () => {
            const document = parse(render(
                <Layout pageTitle="My title">
                    <div>Hello!</div>
                </Layout>
            ));

            // Renders the html document.
            const html = document.firstChild as HTMLElement;
            expect(html.tagName).toBe('HTML');
            expect(html.getAttribute('lang')).toBe('en');

            // Renders the utf8 charset meta tag.
            const meta = html.querySelector('head > meta[charset]');
            expect(meta).not.toBeNull();
            expect(meta!.getAttribute('charset')).toBe('utf8');

            // Renders title.
            const title = html.querySelector('head > title');
            expect(title).not.toBeNull();
            expect(title!.textContent).toBe('@rules_prerender - My title');

            // Renders header.
            const header = html.querySelector('body > header');
            expect(header).not.toBeNull();

            // Renders footer.
            const footer = html.querySelector('body > footer');
            expect(footer).not.toBeNull();

            // Renders main content.
            const main = html.querySelector('body > main');
            expect(main).not.toBeNull();
            const content = main!.firstChild as HTMLElement;
            expect(content).not.toBeNull();
            expect(content!.tagName).toBe('DIV');
            expect(content!.textContent).toBe('Hello!');
        });

        it('renders title to the `<header>` element', () => {
            const document = parse(render(
                <Layout pageTitle="Page title" headerTitle="Header title">
                </Layout>
            ));
            expect(document).not.toBeNull();

            const title =
                document.querySelector('body > header [part="title"]');
            expect(title).not.toBeNull();
            expect(title!.textContent).toBe('Header title');
        });

        it('renders head children to the `<head>` element', () => {
            const document = parse(render(
                <Layout pageTitle="Title" headChildren={
                    <meta content="test" />
                }>
                </Layout>
            ));
            expect(document).toBeDefined();

            const meta = document.querySelector('head > meta[content="test"]');
            expect(meta).not.toBeNull();
        });
    });
});
