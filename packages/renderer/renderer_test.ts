import 'jasmine';

import { env } from 'process';
import { promises as fs } from 'fs';
import { resolveRunfile } from 'rules_prerender/common/runfiles';
import { execBinary, ProcessResult } from 'rules_prerender/common/testing/binary';

const testTmpDir = env['TEST_TMPDIR'];
if (!testTmpDir) throw new Error('$TEST_TMPDIR not set.');

const renderer = resolveRunfile(
        'rules_prerender/packages/renderer/renderer_test_binary.sh');

/** Invokes the renderer binary. */
async function run({ entryPoint, output }: {
    entryPoint: string,
    output: string,
}): Promise<ProcessResult> {
    return await execBinary(renderer, [
        '--entry-point', entryPoint,
        '--output', output,
    ]);
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
