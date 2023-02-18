import { promises as fs } from 'fs';
import { useTempDir } from '../../common/testing/temp_dir';
import { execBinary, ProcessResult } from '../../common/testing/binary';

const binary = 'packages/css_bundler/css_bundler.sh';

async function run({ entryPoints, outputs }: {
    entryPoints: string[],
    outputs: string[],
}): Promise<ProcessResult> {
    const entryPointFlags =
        entryPoints.flatMap((entryPoint) => [ '--entry-point', entryPoint ]);
    const outputFlags = outputs.flatMap((output) => [ '--output', output ]);
    return await execBinary(binary, [
        ...entryPointFlags,
        ...outputFlags,
    ]);
}

describe('css_bundler', () => {
    const tmpDir = useTempDir();

    it('bundles styles', async () => {
        await Promise.all([
            fs.writeFile(`${tmpDir.get()}/input.css`, `
@import './dep.css';

.entry { color: red; }
            `.trim()),
            fs.writeFile(`${tmpDir.get()}/dep.css`, '.dep { color: green; }'),
        ]);

        const { code, stdout, stderr } = await run({
            entryPoints: [ `${tmpDir.get()}/input.css` ],
            outputs: [ `${tmpDir.get()}/output.css` ],
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const output = await fs.readFile(`${tmpDir.get()}/output.css`, 'utf8');
        expect(output).toContain('.dep');
        expect(output).toContain('.entry');
        expect(output).not.toContain('@import');
    });

    it('bundles multiple entry points', async () => {
        await Promise.all([
            fs.writeFile(`${tmpDir.get()}/input1.css`, `
@import './dep.css';

.input1 { color: red; }
            `.trim()),
            fs.writeFile(`${tmpDir.get()}/input2.css`, `
@import './dep.css';

.input2 { color: green; }
            `.trim()),
            fs.writeFile(`${tmpDir.get()}/dep.css`, '.dep { color: blue; }'),
        ]);

        const { code, stdout, stderr } = await run({
            entryPoints: [
                `${tmpDir.get()}/input1.css`,
                `${tmpDir.get()}/input2.css`,
            ],
            outputs: [
                `${tmpDir.get()}/output1.css`,
                `${tmpDir.get()}/output2.css`,
            ],
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const output1 = await fs.readFile(`${tmpDir.get()}/output1.css`, 'utf8');
        expect(output1).toContain('.input1');
        expect(output1).toContain('.dep');
        expect(output1).not.toContain('@import');
        expect(output1).not.toContain('.input2');

        const output2 = await fs.readFile(`${tmpDir.get()}/output2.css`, 'utf8');
        expect(output2).toContain('.input2');
        expect(output2).toContain('.dep');
        expect(output2).not.toContain('@import');
        expect(output2).not.toContain('.input1');
    });

    it('fails when given no entry points', async () => {
        const { code, stderr } = await run({ entryPoints: [], outputs: [] });

        expect(code).toBe(1, `Binary unexpectedly succeeded. STDERR:\n${stderr}`);
        expect(stderr).toContain('Received no entry points.');
    });

    it('fails when given an inconsistent number of entry points and outputs', async () => {
        await fs.writeFile(`${tmpDir.get()}/input.css`, '.input { color: red; }');

        const { code, stderr } = await run({
            entryPoints: [ `${tmpDir.get()}/input.css` ],
            outputs: [
                `${tmpDir.get()}/output1.css`,
                `${tmpDir.get()}/output2.css`,
            ],
        });

        expect(code).toBe(1, `Binary unexpectedly succeeded. STDERR:\n${stderr}`);
        expect(stderr).toContain(
            'Received different number of `--entry-point` (1) and `--output` (2) arguments');
    });
});
