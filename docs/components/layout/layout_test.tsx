import { render } from 'preact-render-to-string';
import { HTMLElement, parse } from 'node-html-parser';
import { Layout } from './layout.js';
import { Route } from 'docs/route.mjs';

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

            const layout = html.querySelector('body > rp-layout')!;
            expect(layout).not.toBeNull();

            // Renders header.
            const header = layout.querySelector('rp-header');
            expect(header).not.toBeNull();

            // Renders footer.
            const footer = layout.querySelector('footer');
            expect(footer).not.toBeNull();

            // Renders main content.
            const main = layout.querySelector('main');
            expect(main).not.toBeNull();
            const content = main!.firstChild as HTMLElement;
            expect(content).not.toBeNull();
            expect(content!.tagName).toBe('DIV');
            expect(content!.textContent).toBe('Hello!');
        });

        it('renders title to the `<rp-header>` element', () => {
            const document = parse(render(
                <Layout pageTitle="Page title" headerTitle="Header title">
                </Layout>
            ));
            expect(document).not.toBeNull();

            const title =
                document.querySelector('rp-header [part="title"]');
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
            expect(document).not.toBeNull();

            const meta = document.querySelector('head > meta[content="test"]');
            expect(meta).not.toBeNull();
        });

        it('renders provided routes', () => {
            const routes = [
                { label: 'Home', content: '/' },
            ] satisfies Route[];

            const document = parse(render(
                <Layout pageTitle="Title" routes={routes}>
                </Layout>
            ));
            expect(document).not.toBeNull();

            const navPane = document.querySelector('rp-nav-pane');
            expect(navPane).not.toBeNull();

            expect(navPane!.textContent).toContain('Home');
        });

        it('does *not* render navigation pane when there are no routes', () => {
            const document = parse(render(
                <Layout pageTitle="Title">
                </Layout>
            ));
            expect(document).not.toBeNull();

            const navPane = document.querySelector('rp-nav-pane');
            expect(navPane).toBeNull();
        });

        it('does *not* render navigation pane when routes are empty', () => {
            const document = parse(render(
                <Layout pageTitle="Title" routes={[]}>
                </Layout>
            ));
            expect(document).not.toBeNull();

            const navPane = document.querySelector('rp-nav-pane');
            expect(navPane).toBeNull();
        });
    });
});
