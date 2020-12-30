import 'jasmine';

import { promises as fs } from 'fs';
import { env } from 'process';
import { resolveRunfile } from 'rules_prerender/common/runfiles';
import { execBinary, ProcessResult } from 'rules_prerender/common/testing/binary';

const testTmpDir = env['TEST_TMPDIR'];
if (!testTmpDir) throw new Error('$TEST_TMPDIR not set.');

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
    let tmpDir: string;
    beforeEach(async () => {
        tmpDir = await fs.mkdtemp(`${testTmpDir}/annotation_extractor_test-`);
    });

    afterEach(async () => {
        await fs.rmdir(tmpDir, { recursive: true });
    });

    it('extracts annotations', async () => {
        await fs.writeFile(`${tmpDir}/input.html`, `
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
            inputHtml: `${tmpDir}/input.html`,
            outputHtml: `${tmpDir}/output.html`,
            outputMetadata: `${tmpDir}/metadata.json`,
        });

        expect(code).toBe(0);
        expect(stdout.trim()).toBe('');
        expect(stderr.trim()).toBe('');

        const output = await fs.readFile(`${tmpDir}/output.html`, {
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

        const metadata = JSON.parse(await fs.readFile(`${tmpDir}/metadata.json`, {
            encoding: 'utf8',
        }));
        expect(metadata).toEqual({
            scripts: [
                { path: 'foo.js' },
                { path: 'bar.js' },
                { path: 'baz.js' },
            ],
        });
    });
});
