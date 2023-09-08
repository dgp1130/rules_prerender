import { renderMarkdown } from './markdown_loader.mjs';

describe('markdown_loader', () => {
    describe('renderMarkdown()', () => {
        it('renders a markdown file from runfiles', async () => {
            const { frontmatter: metadata, html } = await renderMarkdown(
                'rules_prerender/docs/markdown/markdown_testdata.md');

            expect(metadata).toEqual({
                key: 'value',
                array: [ 1, 2, 3 ],
                nested: {
                    foo: 'bar',
                },
            });

            expect(html.getHtmlAsString()).toContain('<h1>Hello, World!</h1>');
        });

        it('throws an error when given a file without an `*.md` extension', async () => {
            await expectAsync(renderMarkdown('rules_prerender/non/md/file.txt'))
                .toBeRejectedWithError(/use the `.md` file extension/);
        });

        it('throws an error when the file is not found', async () => {
            await expectAsync(renderMarkdown('rules_prerender/does/not/exist.md'))
                .toBeRejectedWithError(/Was it included as a `data` dependency\?/);
        });
    });
});
