import 'jasmine';

import { execFile as execFileCb } from 'child_process';
import { env } from 'process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { resolveRunfile } from 'rules_prerender/common/runfiles';
import { InjectorConfig } from 'rules_prerender/packages/resource_injector/config';

const execFile = promisify(execFileCb);

const testTmpDir = env['TEST_TMPDIR'];
if (!testTmpDir) throw new Error('$TEST_TMPDIR not set.');

const injector = resolveRunfile(
        'rules_prerender/packages/resource_injector/resource_injector.sh');

/** Invokes the renderer binary. */
async function run({ input, config, output }: {
    input: string,
    config: string,
    output: string,
}): Promise<{ code: number, stdout: string, stderr: string }> {
    try {
        const { stdout, stderr } = await execFile(injector, [
            '--input', input,
            '--config', config,
            '--output', output,
        ]);
        return { code: 0, stdout, stderr };
    } catch (err) {
        const { code, stdout, stderr } = err;
        return { code, stdout, stderr };
    }
}

describe('injector', () => {
    let tmpDir: string;
    beforeEach(async () => {
        tmpDir = await fs.mkdtemp(`${testTmpDir}/renderer_test-`);
    });

    afterEach(async () => {
        await fs.rmdir(tmpDir, { recursive: true });
    });

    it('injects scripts', async () => {
        await fs.writeFile(`${tmpDir}/input.html`, `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
        `.trim());

        const config: InjectorConfig = [
            { type: 'script', path: '/foo.js' },
            { type: 'script', path: '/bar.js' },
            { type: 'script', path: '/baz.js' },
        ];
        await fs.writeFile(`${tmpDir}/config.json`,
                JSON.stringify(config, null /* replacer */, 4 /* tabSize */));

        const { code, stdout, stderr } = await run({
            input: `${tmpDir}/input.html`,
            config: `${tmpDir}/config.json`,
            output: `${tmpDir}/output.html`,
        });

        expect(code).toBe(0);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const output = await fs.readFile(`${tmpDir}/output.html`, {
            encoding: 'utf8',
        });
        expect(output).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    <script src="/foo.js" type="module" async></script>
<script src="/bar.js" type="module" async></script>
<script src="/baz.js" type="module" async></script>
</head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
        `.trim());
    });

    it('exits with non-zero exit code when injector fails', async () => {
        await fs.writeFile(`${tmpDir}/input.html`, 'not an HTML document');

        const config: InjectorConfig = [
            { type: 'script', path: '/foo.js' },
        ];
        await fs.writeFile(`${tmpDir}/config.json`,
                JSON.stringify(config, null /* replacer */, 4 /* tabSize */));

        const { code, stdout, stderr } = await run({
            input: `${tmpDir}/input.html`,
            config: `${tmpDir}/config.json`,
            output: `${tmpDir}/output.html`,
        });

        expect(code).not.toBe(0);
        expect(stdout).toBe('');
        expect(stderr).not.toBe('');
    });
});
