import 'jasmine';

import { promises as fs } from 'fs';
import { mockPrerenderMetadata, mockScriptMetadata } from 'rules_prerender/common/models/prerender_metadata_mock';
import { resolveRunfile } from 'rules_prerender/common/runfiles';
import { execBinary, ProcessResult } from 'rules_prerender/common/testing/binary';
import { useTempDir } from 'rules_prerender/common/testing/temp_dir';

const entryGenerator = resolveRunfile(
        'rules_prerender/packages/script_entry_generator/script_entry_generator.sh');

/** Invokes the entry generator binary. */
async function run({ metadata, output }: { metadata: string, output: string }):
        Promise<ProcessResult> {
    return await execBinary(entryGenerator, [
        '--metadata', metadata,
        '--output', output,
    ]);
}

describe('script_entry_generator', () => {
    const tmpDir = useTempDir();

    it('generates an entry point', async () => {
        const metadata = mockPrerenderMetadata({
            scripts: [
                mockScriptMetadata({ path: 'wksp/foo/bar/baz' }),
                mockScriptMetadata({ path: 'wksp/hello/world' }),
            ],
        });
        await fs.writeFile(`${tmpDir.get()}/metadata.json`,
                JSON.stringify(metadata, null /* replacer */, 4 /* tabSize */));
        
        const { code, stdout, stderr } = await run({
            metadata: `${tmpDir.get()}/metadata.json`,
            output: `${tmpDir.get()}/entryPoint.ts`,
        });

        expect(code).toBe(0);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const entryPoint = await fs.readFile(`${tmpDir.get()}/entryPoint.ts`, {
            encoding: 'utf8',
        });

        expect(entryPoint).toBe(`
import 'wksp/foo/bar/baz';
import 'wksp/hello/world';
        `.trim());
    });

    it('exits with non-zero exit code if metadata is not valid JSON', async () => {
        await fs.writeFile(`${tmpDir.get()}/metadata.json`, 'not JSON');

        const { code, stdout, stderr } = await run({
            metadata: `${tmpDir.get()}/metadata.json`,
            output: `${tmpDir.get()}/entryPoint.ts`,
        });

        expect(code).toBe(1);
        expect(stdout).toBe('');
        expect(stderr).toContain('JSON');
    });
});
