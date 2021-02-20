import { promises as fs } from 'fs';
import * as path from 'path';
import { PrerenderResource } from 'rules_prerender';
import { resolveRunfile } from 'rules_prerender/common/runfiles';

export default async function*():
        AsyncGenerator<PrerenderResource, void, void> {
    // Read all files under `content/` in runfiles.
    const content = resolveRunfile('rules_prerender/examples/data/content/');
    const entries = await fs.readdir(content, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile());

    // Generate an index page which links to all posts.
    yield PrerenderResource.of('/index.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>Data</title>
        <meta charset="utf8">
    </head>
    <body>
        <h2>Data</h2>

        <ul>
            ${files.map((file) => `
                <li><a href="/posts/${getBaseName(file.name)}.html">${getBaseName(file.name)}</a></li>
            `.trim()).join('\n')}
        </ul>
    </body>
</html>
    `.trim());

    // Generate an HTML page with the content of each file.
    for (const file of files) {
        const baseName = getBaseName(file.name);
        const text = await fs.readFile(path.join(content, file.name), {
            encoding: 'utf8',
        });

        yield PrerenderResource.of(`/posts/${baseName}.html`, `
<!DOCTYPE html>
<html>
    <head>
        <title>${baseName}</title>
        <meta charset="utf8">
    </head>
    <body>
        <h2>${baseName}</h2>
        <article>${text.trim()}</article>
    </body>
</html>
        `.trim());
    }
}

function getBaseName(fileName: string): string {
    return fileName.split('.').slice(0, -1).join('.');
}
