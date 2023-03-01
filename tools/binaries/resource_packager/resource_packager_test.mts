import { promises as fs } from 'fs';
import { useTempDir } from '../../../common/testing/temp_dir.mjs';
import { ProcessResult, execBinary } from '../../../common/testing/binary.mjs';

const binary = 'tools/binaries/resource_packager/resource_packager.sh';

async function run({ urlPaths, fileRefs, mergeDirs, destDir }: {
    urlPaths: string[],
    fileRefs: string[],
    mergeDirs: string[],
    destDir: string,
}): Promise<ProcessResult> {
    const urlPathFlags =
        urlPaths.flatMap((urlPath) => [ '--url-path', urlPath ]);
    const fileRefFlags =
        fileRefs.flatMap((fileRef) => [ '--file-ref', fileRef ]);
    const mergeDirFlags =
        mergeDirs.flatMap((mergeDir) => [ '--merge-dir', mergeDir ]);
    return await execBinary(binary, [
        ...urlPathFlags,
        ...fileRefFlags,
        ...mergeDirFlags,
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
            mergeDirs: [],
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

    it('merges with dependent packages', async () => {
        // Output directory should already exist.
        await fs.mkdir(`${tmpDir.get()}/output`, { recursive: true });

        await fs.writeFile(`${tmpDir.get()}/foo.txt`, 'I am foo.txt!');
        await fs.writeFile(`${tmpDir.get()}/bar.txt`, 'I am bar.txt!');

        await fs.mkdir(`${tmpDir.get()}/dep1`);
        await fs.writeFile(`${tmpDir.get()}/dep1/hello.txt`, 'I am hello.txt!');

        await fs.mkdir(`${tmpDir.get()}/dep2/test`, { recursive: true });
        await fs.writeFile(`${tmpDir.get()}/dep2/test/world.txt`,
            'I am world.txt!');

        const { code, stdout, stderr } = await run({
            urlPaths: [ '/foo/some_file.txt', '/bar.txt' ],
            fileRefs: [ `${tmpDir.get()}/foo.txt`, `${tmpDir.get()}/bar.txt` ],
            mergeDirs: [ `${tmpDir.get()}/dep1`, `${tmpDir.get()}/dep2` ],
            destDir: `${tmpDir.get()}/output`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const outputFoo = await fs.readFile(
            `${tmpDir.get()}/output/foo/some_file.txt`,
            { encoding: 'utf8' },
        );
        expect(outputFoo).toBe('I am foo.txt!');

        const outputBar = await fs.readFile(
            `${tmpDir.get()}/output/bar.txt`,
            { encoding: 'utf8' },
        );
        expect(outputBar).toBe('I am bar.txt!');

        const outputHello = await fs.readFile(
            `${tmpDir.get()}/output/hello.txt`,
            { encoding: 'utf8' },
        );
        expect(outputHello).toBe('I am hello.txt!');

        const outputWorld = await fs.readFile(
            `${tmpDir.get()}/output/test/world.txt`,
            { encoding: 'utf8' },
        );
        expect(outputWorld).toBe('I am world.txt!');
    });

    it('does nothing if given no URL paths or file refs', async () => {
        // Output directory should already exist.
        await fs.mkdir(`${tmpDir.get()}/output`);

        const { code, stdout, stderr } = await run({
            urlPaths: [],
            fileRefs: [],
            mergeDirs: [],
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
            mergeDirs: [],
            destDir: `${tmpDir.get()}/output`,
        });

        expect(code).toBe(1);
        expect(stderr).toContain(
            'got 2 `--url-path` flag(s) and 1 `--file-ref` flag(s)');
    });
});
