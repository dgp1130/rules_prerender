import 'jasmine';

import { promises as fs } from 'fs';
import { mockPrerenderMetadata, mockScriptMetadata } from 'rules_prerender/common/models/prerender_metadata_mock';
import { resolveRunfile } from 'rules_prerender/common/runfiles';
import { PrerenderMetadata } from 'rules_prerender/common/models/prerender_metadata';
import { execBinary, ProcessResult } from 'rules_prerender/common/testing/binary';
import { useTempDir } from 'rules_prerender/common/testing/temp_dir';

const extractor = resolveRunfile(
    'rules_prerender/packages/annotation_extractor/annotation_extractor.sh');

async function run({ inputHtml, outputHtml, outputMetadata }: {
    inputHtml: string,
    outputHtml: string,
    outputMetadata: string,
}): Promise<ProcessResult> {
    return await execBinary(extractor, [
        '--input-html', inputHtml,
        '--output-html', outputHtml,
        '--output-metadata', outputMetadata,
    ]);
}

describe('annotation_extractor', () => {
    const tmpDir = useTempDir();

    it('extracts annotations', async () => {
        await fs.writeFile(`${tmpDir.get()}/input.html`, `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Some header</h2>

        <!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"script","path":"foo.js"} -->
        <!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"script","path":"bar.js"} -->
        <!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"script","path":"baz.js"} -->
    </body>
</html>
        `.trim());

        const { code, stdout, stderr } = await run({
            inputHtml: `${tmpDir.get()}/input.html`,
            outputHtml: `${tmpDir.get()}/output.html`,
            outputMetadata: `${tmpDir.get()}/metadata.json`,
        });

        expect(code).toBe(0);
        expect(stdout.trim()).toBe('');
        expect(stderr.trim()).toBe('');

        const output = await fs.readFile(`${tmpDir.get()}/output.html`, {
            encoding: 'utf8',
        });
        expect(output).toBe(`
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
        )) as PrerenderMetadata;
        expect(metadata).toEqual(mockPrerenderMetadata({
            scripts: [
                mockScriptMetadata({ path: 'foo.js' }),
                mockScriptMetadata({ path: 'bar.js' }),
                mockScriptMetadata({ path: 'baz.js' }),
            ],
        }));
    });

    it('deduplicates extracted annotations', async () => {
        await fs.writeFile(`${tmpDir.get()}/input.html`, `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Some header</h2>

        <!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"script","path":"foo.js"} -->
        <!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - {"type":"script","path":"foo.js"} -->
    </body>
</html>
        `.trim());

        const { code, stdout, stderr } = await run({
            inputHtml: `${tmpDir.get()}/input.html`,
            outputHtml: `${tmpDir.get()}/output.html`,
            outputMetadata: `${tmpDir.get()}/metadata.json`,
        });

        expect(code).toBe(0);
        expect(stdout.trim()).toBe('');
        expect(stderr.trim()).toBe('');

        const metadata = JSON.parse(
            await fs.readFile(`${tmpDir.get()}/metadata.json`,
            { encoding: 'utf8' },
        )) as PrerenderMetadata;
        expect(metadata).toEqual(mockPrerenderMetadata({
            scripts: [
                mockScriptMetadata({ path: 'foo.js' }),
            ],
        }));
    });
});
