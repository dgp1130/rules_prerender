import { promises as fs } from 'fs';
import * as path from 'path';
import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';

const content = `${process.env['RUNFILES']}/rules_prerender/examples/data/content`;

export default async function*():
        AsyncGenerator<PrerenderResource, void, void> {
    // Read all files under `content/` in runfiles.
    const entries = await fs.readdir(content, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile());

    // Generate an index page which links to all posts.
    yield PrerenderResource.fromHtml('/index.html', renderToHtml(
        <html>
            <head>
                <title>Data</title>
                <meta charSet='utf8' />
            </head>
            <body>
                <h2>Data</h2>

                <ul>
                    {files.map((file) => 
                        <li>
                            <a href={`/posts/${getBaseName(file.name)}.html`}>
                                {getBaseName(file.name)}
                            </a>
                        </li>
                    )}
                </ul>
            </body>
        </html>
    ));

    // Generate an HTML page with the content of each file.
    for (const file of files) {
        const baseName = getBaseName(file.name);
        const text = await fs.readFile(path.join(content, file.name), {
            encoding: 'utf8',
        });

        yield PrerenderResource.fromHtml(`/posts/${baseName}.html`, renderToHtml(
            <html>
                <head>
                    <title>{baseName}</title>
                    <meta charSet="utf8" />
                </head>
                <body>
                    <h2>{baseName}</h2>
                    <article>{text.trim()}</article>
                </body>
            </html>
        ));
    }
}

function getBaseName(fileName: string): string {
    return fileName.split('.').slice(0, -1).join('.');
}
