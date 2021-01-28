import 'jasmine';

import { promises as fs } from 'fs';
import { resolveRunfile } from 'rules_prerender/common/runfiles';
import { execBinary, ProcessResult } from 'rules_prerender/common/testing/binary';
import { useTempDir } from 'rules_prerender/common/testing/temp_dir';

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
    const tmpDir = useTempDir();

    it('renders hello', async () => {
        await fs.writeFile(`${tmpDir.get()}/foo.js`, `
module.exports = () => {
    return 'Hello, World!';
};
        `.trim());

        const { code, stdout, stderr } = await run({
            entryPoint: `${tmpDir.get()}/foo.js`,
            output: `${tmpDir.get()}/rendered.txt`,
        });

        expect(code).toBe(0);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const rendered = await fs.readFile(
                `${tmpDir.get()}/rendered.txt`, 'utf8');
        expect(rendered).toBe('Hello, World!');
    });

    it('renders awaited hello', async () => {
        await fs.writeFile(`${tmpDir.get()}/foo.js`, `
module.exports = () => {
    return Promise.resolve('Hello, World!');
};
        `.trim());

        const { code, stdout, stderr } = await run({
            entryPoint: `${tmpDir.get()}/foo.js`,
            output: `${tmpDir.get()}/rendered.txt`,
        });

        expect(code).toBe(0);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const rendered = await fs.readFile(
                `${tmpDir.get()}/rendered.txt`, 'utf8');
        expect(rendered).toBe('Hello, World!');
    });

    it('fails from import errors from the entry point', async () => {
        await fs.writeFile(`${tmpDir.get()}/foo.js`, `
module.exports = 'Hello, World!'; // Not a function...
        `.trim());

        const { code, stdout, stderr } = await run({
            entryPoint: `${tmpDir.get()}/foo.js`,
            output: `${tmpDir.get()}/rendered.txt`,
        });

        expect(code).toBe(1);
        expect(stdout).toBe('');
        expect(stderr).toContain(`${tmpDir.get()}/foo.js`);
        expect(stderr).toContain(
                'provided a default export that was not a function');
        // Stack trace should not be displayed for user-fault errors.
        expect(stderr).not.toContain('    at ');
        
        // `rendered.txt` should not exist.
        await expectAsync(fs.access(`${tmpDir.get()}/rendered.txt`))
                .toBeRejected();
    });

    it('fails from a non-string result from the entry point', async () => {
        await fs.writeFile(`${tmpDir.get()}/foo.js`, `
// We can't rely on the linker to resolve imports for us. We also don't want to
// rely on the legacy require() patch, so instead we need to manually load the
// runfiles helper and require() the file through it.
const runfiles = require(process.env['BAZEL_NODE_RUNFILES_HELPER']);
const { PrerenderResource } = require(runfiles.resolveWorkspaceRelative('common/models/prerender_resource.js'));

// Return a value which is valid user code, but incompatible with renderer due
// to not being a \`string\` or \`Promise<string>\`.
module.exports = () => [
    PrerenderResource.of('/foo.html', 'foo'),
];
        `.trim());

        const { code, stdout, stderr } = await run({
            entryPoint: `${tmpDir.get()}/foo.js`,
            output: `${tmpDir.get()}/rendered.txt`,
        });

        expect(code).toBe(1);
        expect(stdout).toBe('');
        expect(stderr).toContain(`${tmpDir.get()}/foo.js`);
        expect(stderr).toContain(
                'return a `string` or `Promise<string>`, but instead got:');
        // Stack trace should not be displayed for user-fault errors.
        expect(stderr).not.toContain('    at ');
        
        // `rendered.txt` should not exist.
        await expectAsync(fs.access(`${tmpDir.get()}/rendered.txt`))
                .toBeRejected();
    });
});
