import 'jasmine';

import { execFile as execFileCb } from 'child_process';
import { promises as fs } from 'fs';
import { env } from 'process';
import { promisify } from 'util';
import { resolveRunfile } from 'rules_prerender/common/runfiles';

const execFile = promisify(execFileCb);

const testTmpDir = env['TEST_TMPDIR'];
if (!testTmpDir) throw new Error('$TEST_TMPDIR not set.');

const extractor = resolveRunfile(
    'rules_prerender/packages/annotation_extractor/annotation_extractor.sh');

interface ProcessResult {
    code: number;
    stdout: string;
    stderr: string;
}

async function run({ inputHtml, outputHtml, outputMetadata }: {
    inputHtml: string,
    outputHtml: string,
    outputMetadata: string,
}): Promise<ProcessResult> {
    try {
        const { stdout, stderr } = await execFile(extractor, [
            '--input-html', inputHtml,
            '--output-html', outputHtml,
            '--output-metadata', outputMetadata,
        ]);
        return {
            code: 0,
            stdout,
            stderr,
        };
    } catch (err) {
        const { code, stdout, stderr } = err;
        return { code, stdout, stderr };
    }
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
