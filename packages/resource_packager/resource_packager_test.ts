import 'jasmine';

import { promises as fs } from 'fs';
import { resolveRunfile } from 'rules_prerender/common/runfiles';
import { useTempDir } from 'rules_prerender/common/testing/temp_dir';
import { ProcessResult, execBinary } from 'rules_prerender/common/testing/binary';

const binary = resolveRunfile(
    'rules_prerender/packages/resource_packager/resource_packager.sh');

async function run({ urlPaths, fileRefs, destDir }: {
    urlPaths: string[],
    fileRefs: string[],
    destDir: string,
}): Promise<ProcessResult> {
    const urlPathFlags =
        urlPaths.flatMap((urlPath) => [ '--url-path', urlPath ]);
    const fileRefFlags =
        fileRefs.flatMap((fileRef) => [ '--file-ref', fileRef ]);
    return await execBinary(binary, [
        ...urlPathFlags,
        ...fileRefFlags,
        '--dest-dir', destDir,
    ]);
}

describe('resource_packager', () => {
    const tmpDir = useTempDir();

    it('packages resources', async () => {
        await Promise.all([
            // Output directory should already exist.
            fs.mkdir(`${tmpDir.get()}/output/nested/dir`, { recursive: true }),
            fs.writeFile(`${tmpDir.get()}/foo.txt`, 'I am foo.txt!'),
            fs.writeFile(`${tmpDir.get()}/bar.txt`, 'I am bar.txt!'),
        ]);

        const { code, stdout, stderr } = await run({
            urlPaths: [ '/foo/some_file.txt', '/bar.txt' ],
            fileRefs: [ `${tmpDir.get()}/foo.txt`, `${tmpDir.get()}/bar.txt` ],
            destDir: `${tmpDir.get()}/output/nested/dir`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const outputFoo = await fs.readFile(
            `${tmpDir.get()}/output/nested/dir/foo/some_file.txt`,
            { encoding: 'utf8' },
        );
        expect(outputFoo).toBe('I am foo.txt!');

        const outputBar = await fs.readFile(
            `${tmpDir.get()}/output/nested/dir/bar.txt`,
            { encoding: 'utf8' },
        );
        expect(outputBar).toBe('I am bar.txt!');
    });

    it('does nothing if given no URL paths or file refs', async () => {
        // Output directory should already exist.
        await fs.mkdir(`${tmpDir.get()}/output`);

        const { code, stdout, stderr } = await run({
            urlPaths: [],
            fileRefs: [],
            destDir: `${tmpDir.get()}/output`,
        });

        expect(code).toBe(0, `Binary unexpected failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const outputs = await fs.readdir(`${tmpDir.get()}/output`, {
            withFileTypes: true,
        });
        expect(outputs).toEqual([]);
    });

    it('fails if the number of URL paths and file refs do not match', async () => {
        // Output directory should already exist.
        await fs.mkdir(`${tmpDir.get()}/output`);

        const { code, stderr } = await run({
            urlPaths: [ '/foo/some_file.txt', '/bar.txt' ], // Two URL paths.
            fileRefs: [ `${tmpDir.get()}/foo.txt` ], // One file ref.
            destDir: `${tmpDir.get()}/output`,
        });

        expect(code).toBe(1);
        expect(stderr).toContain(
            'got 2 `--url-path` flag(s) and 1 `--file-ref` flag(s)');
    });
});
