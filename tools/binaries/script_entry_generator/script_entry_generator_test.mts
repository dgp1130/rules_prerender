import { promises as fs } from 'fs';
import { mockPrerenderMetadata, mockScriptMetadata } from '../../../common/models/prerender_metadata_mock.mjs';
import { execBinary, ProcessResult } from '../../../common/testing/binary.mjs';
import { useTempDir } from '../../../common/testing/temp_dir.mjs';

const entryGenerator = 'tools/binaries/script_entry_generator/script_entry_generator.sh';

/** Invokes the entry generator binary. */
async function run({ metadata, outputDir, root }: {
    metadata: string,
    outputDir: string,
    root: string,
}): Promise<ProcessResult> {
    return await execBinary(entryGenerator, [
        '--metadata', metadata,
        '--output-dir', outputDir,
        '--root', root,
    ]);
}

describe('script_entry_generator', () => {
    const tmpDir = useTempDir();

    it('generates entry points', async () => {
        await fs.mkdir(`${tmpDir.get()}/output`, { recursive: true });

        const metadata = mockPrerenderMetadata({
            includedScripts: {
                '/page.html': [ mockScriptMetadata({ path: 'foo/bar/baz' }) ],
                '/nested/other.html': [
                    mockScriptMetadata({ path: 'foo/bar/baz' }),
                    mockScriptMetadata({ path: 'hello/world' }),
                ],
            },
        });
        await fs.writeFile(`${tmpDir.get()}/metadata.json`,
            JSON.stringify(metadata, null /* replacer */, 4 /* tabSize */));

        const { code, stdout, stderr } = await run({
            metadata: `${tmpDir.get()}/metadata.json`,
            outputDir: `${tmpDir.get()}/output`,
            root: tmpDir.get(),
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const pageEntryPoint = await fs.readFile(
            `${tmpDir.get()}/output/page.js`, 'utf8');

        expect(pageEntryPoint).toBe(`
import '../foo/bar/baz';
        `.trim());

        const otherEntryPoint = await fs.readFile(
            `${tmpDir.get()}/output/nested/other.js`, 'utf8');

        expect(otherEntryPoint).toBe(`
import '../../foo/bar/baz';
import '../../hello/world';
        `.trim());
    });

    it('ignores empty entry points', async () => {
        await fs.mkdir(`${tmpDir.get()}/output`, { recursive: true });

        const metadata = mockPrerenderMetadata({
            includedScripts: {
                '/page.html': [ mockScriptMetadata({ path: 'foo/bar/baz' }) ],
                '/empty.html': [],
            },
        });
        await fs.writeFile(`${tmpDir.get()}/metadata.json`,
            JSON.stringify(metadata, null /* replacer */, 4 /* tabSize */));

        const { code, stdout, stderr } = await run({
            metadata: `${tmpDir.get()}/metadata.json`,
            outputDir: `${tmpDir.get()}/output`,
            root: tmpDir.get(),
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        // `/empty.js` should *not* be generated, because it would be empty.
        await expectAsync(fs.access(`${tmpDir.get()}/output/page.js`))
            .toBeResolved();
        await expectAsync(fs.access(`${tmpDir.get()}/output/empty.js`))
            .toBeRejected();
    });

    it('exits with non-zero exit code if metadata is not valid JSON', async () => {
        await fs.mkdir(`${tmpDir.get()}/output`, { recursive: true });
        await fs.writeFile(`${tmpDir.get()}/metadata.json`, 'not JSON');

        const { code, stdout, stderr } = await run({
            metadata: `${tmpDir.get()}/metadata.json`,
            outputDir: `${tmpDir.get()}/output`,
            root: tmpDir.get(),
        });

        expect(code)
            .toBe(1, `Binary unexpectedly succeeded. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toContain('JSON');
    });
});
