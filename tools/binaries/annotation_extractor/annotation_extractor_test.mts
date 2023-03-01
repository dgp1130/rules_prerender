import { promises as fs } from 'fs';
import { mockPrerenderMetadata, mockScriptMetadata } from '../../../common/models/prerender_metadata_mock.mjs';
import { PrerenderMetadata } from '../../../common/models/prerender_metadata.mjs';
import { execBinary, ProcessResult } from '../../../common/testing/binary.mjs';
import { useTempDir } from '../../../common/testing/temp_dir.mjs';
import { createAnnotation } from '../../../common/models/prerender_annotation.mjs';

const extractor = 'tools/binaries/annotation_extractor/annotation_extractor.sh';

async function run({ inputDir, outputHtmlDir, outputMetadata }: {
    inputDir: string,
    outputHtmlDir: string,
    outputMetadata: string,
}): Promise<ProcessResult> {
    return await execBinary(extractor, [
        '--input-dir', inputDir,
        '--output-dir', outputHtmlDir,
        '--output-metadata', outputMetadata,
    ]);
}

describe('annotation_extractor', () => {
    const tmpDir = useTempDir();

    it('extracts annotations', async () => {
        const annotation1 = createAnnotation({ type: 'script', path: 'foo.js' });
        const annotation2 = createAnnotation({ type: 'script', path: 'bar.js' });

        await fs.mkdir(`${tmpDir.get()}/input_html`, { recursive: true });
        await fs.mkdir(`${tmpDir.get()}/output_html`, { recursive: true });

        await fs.writeFile(`${tmpDir.get()}/input_html/foo.html`, `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Some header</h2>

        <!-- ${annotation1} -->
    </body>
</html>
        `.trim());
        await fs.writeFile(`${tmpDir.get()}/input_html/bar.html`, `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Some header</h2>

        <!-- ${annotation2} -->
    </body>
</html>
        `.trim());

        const { code, stdout, stderr } = await run({
            inputDir: `${tmpDir.get()}/input_html`,
            outputHtmlDir: `${tmpDir.get()}/output_html`,
            outputMetadata: `${tmpDir.get()}/metadata.json`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout.trim()).toBe('');
        expect(stderr.trim()).toBe('');

        const foo = await fs.readFile(`${tmpDir.get()}/output_html/foo.html`, {
            encoding: 'utf8',
        });
        expect(foo).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Some header</h2>

        
    </body>
</html>
        `.trim());

        const bar = await fs.readFile(`${tmpDir.get()}/output_html/bar.html`, {
            encoding: 'utf8',
        });
        expect(bar).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Some header</h2>

        
    </body>
</html>
        `.trim());

        const metadata = JSON.parse(
            await fs.readFile(`${tmpDir.get()}/metadata.json`,
                { encoding: 'utf8' },
            ),
        ) as PrerenderMetadata;
        expect(metadata).toEqual(mockPrerenderMetadata({
            includedScripts: {
                '/foo.html': [ mockScriptMetadata({ path: 'foo.js' }) ],
                '/bar.html': [ mockScriptMetadata({ path: 'bar.js' }) ],
            },
        }));
    });

    it('deduplicates extracted annotations', async () => {
        const annotation = createAnnotation({ type: 'script', path: 'foo.js' });

        await fs.mkdir(`${tmpDir.get()}/input_html`, { recursive: true });
        await fs.mkdir(`${tmpDir.get()}/output_html`, { recursive: true });

        await fs.writeFile(`${tmpDir.get()}/input_html/foo.html`, `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Some header</h2>

        <!-- ${annotation} -->
    </body>
</html>
        `.trim());
        await fs.writeFile(`${tmpDir.get()}/input_html/bar.html`, `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Some header</h2>

        <!-- ${annotation} -->
    </body>
</html>
        `.trim());

        const { code, stdout, stderr } = await run({
            inputDir: `${tmpDir.get()}/input_html`,
            outputHtmlDir: `${tmpDir.get()}/output_html`,
            outputMetadata: `${tmpDir.get()}/metadata.json`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout.trim()).toBe('');
        expect(stderr.trim()).toBe('');

        const metadata = JSON.parse(
            await fs.readFile(`${tmpDir.get()}/metadata.json`,
                { encoding: 'utf8' },
            ),
        ) as PrerenderMetadata;
        expect(metadata).toEqual(mockPrerenderMetadata({
            includedScripts: {
                '/foo.html': [ mockScriptMetadata({ path: 'foo.js' }) ],
                '/bar.html': [ mockScriptMetadata({ path: 'foo.js' }) ],
            },
        }));
    });

    it('extracts annotations from a file in a nested directory', async () => {
        const annotation = createAnnotation({ type: 'script', path: 'foo.js' });

        await fs.mkdir(`${tmpDir.get()}/input_html`, { recursive: true });
        await fs.mkdir(`${tmpDir.get()}/output_html`, { recursive: true });

        await fs.mkdir(`${tmpDir.get()}/input_html/hello`, { recursive: true });
        await fs.writeFile(`${tmpDir.get()}/input_html/hello/world.html`, `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Some header</h2>

        <!-- ${annotation} -->
    </body>
</html>
        `.trim());

        const { code, stdout, stderr } = await run({
            inputDir: `${tmpDir.get()}/input_html`,
            outputHtmlDir: `${tmpDir.get()}/output_html`,
            outputMetadata: `${tmpDir.get()}/metadata.json`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout.trim()).toBe('');
        expect(stderr.trim()).toBe('');

        const fileContents = await fs.readFile(
            `${tmpDir.get()}/output_html/hello/world.html`,
            { encoding: 'utf8' },
        );
        expect(fileContents).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Some header</h2>

        
    </body>
</html>
        `.trim());

        const metadata = JSON.parse(
            await fs.readFile(`${tmpDir.get()}/metadata.json`,
                { encoding: 'utf8' },
            ),
        ) as PrerenderMetadata;
        expect(metadata).toEqual(mockPrerenderMetadata({
            includedScripts: {
                '/hello/world.html': [ mockScriptMetadata({ path: 'foo.js' }) ],
            },
        }));
    });

    it('passes through non-HTML files', async () => {
        const annotation = createAnnotation({ type: 'script', path: 'foo.js' });

        await fs.mkdir(`${tmpDir.get()}/input_html`, { recursive: true });
        await fs.mkdir(`${tmpDir.get()}/output_html`, { recursive: true });

        await fs.mkdir(`${tmpDir.get()}/input_html/hello/there`, {
            recursive: true,
        });
        await fs.writeFile(`${tmpDir.get()}/input_html/hello/there/world.txt`, `
Hello, World!

Annotation should **not** be processed.
<!-- ${annotation} -->
        `.trim());

        const { code, stdout, stderr } = await run({
            inputDir: `${tmpDir.get()}/input_html`,
            outputHtmlDir: `${tmpDir.get()}/output_html`,
            outputMetadata: `${tmpDir.get()}/metadata.json`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout.trim()).toBe('');
        expect(stderr.trim()).toBe('');

        const fileContents = await fs.readFile(
            `${tmpDir.get()}/output_html/hello/there/world.txt`,
            { encoding: 'utf8' },
        );
        expect(fileContents).toBe(`
Hello, World!

Annotation should **not** be processed.
<!-- ${annotation} -->
        `.trim());

        const metadata = JSON.parse(
            await fs.readFile(`${tmpDir.get()}/metadata.json`,
                { encoding: 'utf8' },
            ),
        ) as PrerenderMetadata;
        expect(metadata).toEqual(mockPrerenderMetadata({
            includedScripts: {},
        }));
    });
});
