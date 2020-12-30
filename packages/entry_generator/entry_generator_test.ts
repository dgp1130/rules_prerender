import 'jasmine';

import { env } from 'process';
import { promises as fs } from 'fs';
import { PrerenderMetadata } from 'rules_prerender/common/models/prerender_metadata';
import { resolveRunfile } from 'rules_prerender/common/runfiles';
import { execBinary, ProcessResult } from 'rules_prerender/common/testing/binary';

const testTmpDir = env['TEST_TMPDIR'];
if (!testTmpDir) throw new Error('$TEST_TMPDIR not set.');

const entryGenerator = resolveRunfile(
        'rules_prerender/packages/entry_generator/entry_generator.sh');

/** Invokes the entry generator binary. */
async function run({ metadata, output }: { metadata: string, output: string }):
        Promise<ProcessResult> {
    return await execBinary(entryGenerator, [
        '--metadata', metadata,
        '--output', output,
    ]);
}

describe('entry_generator', () => {
    let tmpDir: string;
    beforeEach(async () => {
        tmpDir = await fs.mkdtemp(`${testTmpDir}/renderer_test-`);
    });

    afterEach(async () => {
        await fs.rmdir(tmpDir, { recursive: true });
    });

    it('generates an entry point', async () => {
        const metadata: PrerenderMetadata = {
            scripts: [
                { path: 'wksp/foo/bar/baz' },
                { path: 'wksp/hello/world' },
            ],
        };
        await fs.writeFile(`${tmpDir}/metadata.json`,
                JSON.stringify(metadata, null /* replacer */, 4 /* tabSize */));
        
        const { code, stdout, stderr } = await run({
            metadata: `${tmpDir}/metadata.json`,
            output: `${tmpDir}/entryPoint.ts`,
        });

        expect(code).toBe(0);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const entryPoint = await fs.readFile(`${tmpDir}/entryPoint.ts`, {
            encoding: 'utf8',
        });

        expect(entryPoint).toBe(`
import 'wksp/foo/bar/baz';
import 'wksp/hello/world';
        `.trim());
    });

    it('exits with non-zero exit code if metadata is not valid JSON', async () => {
        await fs.writeFile(`${tmpDir}/metadata.json`, 'not JSON');

        const { code, stdout, stderr } = await run({
            metadata: `${tmpDir}/metadata.json`,
            output: `${tmpDir}/entryPoint.ts`,
        });

        expect(code).toBe(1);
        expect(stdout).toBe('');
        expect(stderr).toContain('JSON');
    });
});
