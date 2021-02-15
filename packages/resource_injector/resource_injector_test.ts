import 'jasmine';

import { promises as fs } from 'fs';
import { resolveRunfile } from 'rules_prerender/common/runfiles';
import { InjectorConfig } from 'rules_prerender/packages/resource_injector/config';
import { execBinary, ProcessResult } from 'rules_prerender/common/testing/binary';
import { useTempDir } from 'rules_prerender/common/testing/temp_dir';

const injector = resolveRunfile(
        'rules_prerender/packages/resource_injector/resource_injector.sh');

/** Invokes the resource injector binary. */
async function run({ input, config, output }: {
    input: string,
    config: string,
    output: string,
}): Promise<ProcessResult> {
    return await execBinary(injector, [
        '--input', input,
        '--config', config,
        '--output', output,
    ]);
}

describe('injector', () => {
    const tmpDir = useTempDir();

    it('injects scripts', async () => {
        await fs.writeFile(`${tmpDir.get()}/input.html`, `
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
        await fs.writeFile(`${tmpDir.get()}/config.json`,
                JSON.stringify(config, null /* replacer */, 4 /* tabSize */));

        const { code, stdout, stderr } = await run({
            input: `${tmpDir.get()}/input.html`,
            config: `${tmpDir.get()}/config.json`,
            output: `${tmpDir.get()}/output.html`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const output = await fs.readFile(`${tmpDir.get()}/output.html`, {
            encoding: 'utf8',
        });
        expect(output).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    <script src="/foo.js" async defer></script>
<script src="/bar.js" async defer></script>
<script src="/baz.js" async defer></script>
</head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
        `.trim());
    });

    it('injects styles', async () => {
        await fs.writeFile(`${tmpDir.get()}/input.html`, `
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

        await fs.writeFile(`${tmpDir.get()}/foo.css`, `.foo { color: red; }`);
        await fs.writeFile(`${tmpDir.get()}/bar.css`, `.bar { color: green; }`);
        await fs.writeFile(`${tmpDir.get()}/baz.css`, `.baz { color: blue; }`);

        const config: InjectorConfig = [
            { type: 'style', path: `${tmpDir.get()}/foo.css` },
            { type: 'style', path: `${tmpDir.get()}/bar.css` },
            { type: 'style', path: `${tmpDir.get()}/baz.css` },
        ];
        await fs.writeFile(`${tmpDir.get()}/config.json`,
                JSON.stringify(config, null /* replacer */, 4 /* tabSize */));

        const { code, stdout, stderr } = await run({
            input: `${tmpDir.get()}/input.html`,
            config: `${tmpDir.get()}/config.json`,
            output: `${tmpDir.get()}/output.html`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const output = await fs.readFile(`${tmpDir.get()}/output.html`, {
            encoding: 'utf8',
        });
        expect(output).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    <style>.foo { color: red; }</style>
<style>.bar { color: green; }</style>
<style>.baz { color: blue; }</style>
</head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
        `.trim());
    });

    it('exits with non-zero exit code when injector fails', async () => {
        await fs.writeFile(
                `${tmpDir.get()}/input.html`, 'not an HTML document');

        const config: InjectorConfig = [
            { type: 'script', path: '/foo.js' },
        ];
        await fs.writeFile(`${tmpDir.get()}/config.json`,
                JSON.stringify(config, null /* replacer */, 4 /* tabSize */));

        const { code, stdout, stderr } = await run({
            input: `${tmpDir.get()}/input.html`,
            config: `${tmpDir.get()}/config.json`,
            output: `${tmpDir.get()}/output.html`,
        });

        expect(code).not.toBe(
            0,
            `Binary unexpectedly succeeded. STDERR:\n${stderr}`,
        );
        expect(stdout).toBe('');
        expect(stderr).toContain('packages/resource_injector/injector.ts');
    });
});
