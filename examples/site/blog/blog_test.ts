import { parse } from 'node-html-parser';
import renderBlog from './blog';

describe('Blog', () => {
    it('generates a list of posts', async () => {
        const resources = await toArray(renderBlog());
        const index = resources.find((res) => res.path === '/blog/index.html');
        expect(index)
            .toBeDefined('renderBlog() did not generate /blog/index.html.');

        // Renders the blog page.
        const page = parse(new TextDecoder().decode(index!.contents));
        expect(page.querySelector('title')!.text).toBe('Blog');

        // Renders links to all generated pages.
        const posts = Object.fromEntries(page.querySelectorAll('article ul a')
            .map((el) => [ el.text, el.getAttribute('href') ]));
        expect(posts).toEqual({
            'Foo': '/blog/posts/foo.html',
            'Bar': '/blog/posts/bar.html',
            'Baz': '/blog/posts/baz.html',
        });
    });

    it('generates the `Foo` post', async () => {
        const resources = await toArray(renderBlog());
        const post = resources
            .find((res) => res.path === '/blog/posts/foo.html');
        expect(post)
            .toBeDefined('renderBlog() did not generate /blog/posts/foo.html.');

        // Renders the Foo post.
        const page = parse(new TextDecoder().decode(post!.contents));
        expect(page.querySelector('title')!.text).toBe('Foo');

        const article = page.querySelector('article')!;
        expect(article.text).toContain('This is a blog post about Foo!');
    });

    it('generates the `Bar` post', async () => {
        const resources = await toArray(renderBlog());
        const post = resources
            .find((res) => res.path === '/blog/posts/bar.html');
        expect(post)
            .toBeDefined('renderBlog() did not generate /blog/posts/bar.html.');

        // Renders the Bar post.
        const page = parse(new TextDecoder().decode(post!.contents));
        expect(page.querySelector('title')!.text).toBe('Bar');

        const article = page.querySelector('article')!;
        expect(article.text)
            .toContain('This is another blog post generated from markdown.');
    });

    it('generates the `Baz` post', async () => {
        const resources = await toArray(renderBlog());
        const post = resources
            .find((res) => res.path === '/blog/posts/baz.html');
        expect(post)
            .toBeDefined('renderBlog() did not generate /blog/posts/baz.html.');

        // Renders the Baz post.
        const page = parse(new TextDecoder().decode(post!.contents));
        expect(page.querySelector('title')!.text).toBe('Baz');

        const article = page.querySelector('article')!;
        expect(article.text).toContain(
            'Here is one more blog post about nothing in particular');
    });
});

async function toArray<T>(input: AsyncIterable<T>): Promise<Array<T>> {
    const array = [] as Array<T>;
    for await (const item of input) {
        array.push(item);
    }
    return array;
}
