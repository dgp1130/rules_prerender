import 'jasmine';

import { execFile as execFileCb } from 'child_process';
import { env } from 'process';
import { promisify } from 'util';
import { promises as fs } from 'fs';

const execFile = promisify(execFileCb);

const runfiles = env['RUNFILES'];
if (!runfiles) throw new Error('$RUNFILES not set.');

const testTmpDir = env['TEST_TMPDIR'];
if (!testTmpDir) throw new Error('$TEST_TMPDIR not set.');

const renderer = `${runfiles}/rules_prerender/renderer/renderer_test_binary.sh`;

/** Invokes the renderer binary. */
async function run({ entryPoint, output }: {
    entryPoint: string,
    output: string,
}): Promise<{ code: number, stdout: string, stderr: string }> {
    try {
        const { stdout, stderr } = await execFile(renderer, [
            '--entry-point', entryPoint,
            '--output', output,
        ]);
        return { code: 0, stdout, stderr };
    } catch (err) {
        const { code, stdout, stderr } = err;
        return { code, stdout, stderr };
    }
}

describe('renderer', () => {
    let tmpDir: string;
    beforeEach(async () => {
        tmpDir = await fs.mkdtemp(`${testTmpDir}/renderer_test-`);
    });

    afterEach(async () => {
        await fs.rmdir(tmpDir, { recursive: true });
    });

    it('renders hello', async () => {
        await fs.writeFile(`${tmpDir}/foo.js`, `
module.exports = () => {
    return 'Hello, World!';
};
        `.trim());

        const { code, stdout, stderr } = await run({
            entryPoint: `${tmpDir}/foo.js`,
            output: `${tmpDir}/rendered.txt`,
        });

        expect(code).toBe(0);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const rendered = await fs.readFile(`${tmpDir}/rendered.txt`, 'utf8');
        expect(rendered).toBe('Hello, World!');
    });

    it('logs import errors from the entry point', async () => {
        await fs.writeFile(`${tmpDir}/foo.js`, `
module.exports = 'Hello, World!'; // Not a function...
        `.trim());

        const { code, stdout, stderr } = await run({
            entryPoint: `${tmpDir}/foo.js`,
            output: `${tmpDir}/rendered.txt`,
        });

        expect(code).toBe(1);
        expect(stdout).toBe('');
        expect(stderr).toContain(`${tmpDir}/foo.js`);
        expect(stderr).toContain(
                'provided a default export that was not a function');
        
        // `rendered.txt` should not exist.
        await expectAsync(fs.access(`${tmpDir}/rendered.txt`)).toBeRejected();
    });
});
