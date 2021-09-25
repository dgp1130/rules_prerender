import { promises as fs } from 'fs';
import * as path from 'path';
import mdLib from 'markdown-it';
import { PrerenderResource } from 'rules_prerender';
import { polyfillDeclarativeShadowDom } from 'rules_prerender/declarative_shadow_dom';
import { srcLink } from 'rules_prerender/examples/site/common/links';
import { baseLayout } from 'rules_prerender/examples/site/components/base/base';

interface PostMeta {
    fileName: string;
    title: string;
    urlPath: string;
}

const postsRoot =
    `${process.env['RUNFILES']}/rules_prerender/examples/site/blog/posts/`;

/** Generates all the blog posts for the site. */
export default async function*():
        AsyncGenerator<PrerenderResource, void, void> {
    // Get all `posts/*.md` files.
    const entries = await fs.readdir(postsRoot, { withFileTypes: true });
    const posts = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
        .sort();

    // Get metadata for each post.
    const postsMeta: PostMeta[] = posts.map((post) => {
        const baseName = post.name.split('.').slice(0, -1).join('.');
        const title = `${baseName[0].toUpperCase()}${baseName.slice(1)}`;
        return {
            fileName: post.name,
            title: title,
            urlPath: `/blog/posts/${baseName}.html`,
        };
    });

    // Generate the root HTML file which links to all posts.
    yield generatePostList('/blog/index.html', postsMeta);

    // Generate each post HTML.
    for (const postMeta of postsMeta) {
        yield await generatePost(postMeta);
    }
}

/** Generate and return a resource with the list of posts at the given path. */
async function generatePostList(path: string, posts: PostMeta[]):
        Promise<PrerenderResource> {
    return PrerenderResource.of(path, await baseLayout('Blog', () => `
<article>
    <template shadowroot="open">
        ${polyfillDeclarativeShadowDom()}

        <p>Check out some blog posts! Each of these pages is authored as simple
        markdown. They are each generated into a full HTML page, leveraging
        shared components and infrastructure.</p>

        <ul>
            ${posts.map(({ title, urlPath: path }) => `
                <li><a href="${path}">${title}</a></li>
            `).join('')}
        </ul>
    </template>
</article>
    `.trim()));
}

/** Generate and return a resource with the content of the post in HTML. */
async function generatePost({ urlPath, title, fileName }: PostMeta):
        Promise<PrerenderResource> {
    const markdown = await fs.readFile(path.join(postsRoot, fileName), {
        encoding: 'utf8',
    });
    const link = srcLink(`/examples/site/blog/posts/${fileName}`);

    return PrerenderResource.of(urlPath, await baseLayout(title, () => `
<article>
    <template shadowroot="open">
        ${polyfillDeclarativeShadowDom()}

        <p>This post generated from <a href="${link}">${fileName}</a>.</p>

        ${mdLib().render(markdown)}
    </template>
</article>
    `));
}
