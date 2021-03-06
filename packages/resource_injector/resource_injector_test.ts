import 'jasmine';

import { promises as fs } from 'fs';
import { resolveRunfile } from 'rules_prerender/common/runfiles';
import { InjectorConfig } from 'rules_prerender/packages/resource_injector/config';
import { execBinary, ProcessResult } from 'rules_prerender/common/testing/binary';
import { useTempDir } from 'rules_prerender/common/testing/temp_dir';

const injector = resolveRunfile(
    'rules_prerender/packages/resource_injector/resource_injector.sh');

/** Invokes the resource injector binary. */
async function run({ inputDir, config, bundle, outputDir }: {
    inputDir: string,
    config: string,
    bundle?: string,
    outputDir: string,
}): Promise<ProcessResult> {
    return await execBinary(injector, [
        '--input-dir', inputDir,
        '--config', config,
        ...(bundle ? [ '--bundle', bundle ] : []),
        '--output-dir', outputDir,
    ]);
}

describe('injector', () => {
    const tmpDir = useTempDir();

    it('injects scripts', async () => {
        await fs.mkdir(`${tmpDir.get()}/input_dir`, { recursive: true });
        await fs.mkdir(`${tmpDir.get()}/output_dir`, { recursive: true });

        await fs.writeFile(`${tmpDir.get()}/input_dir/page.html`, `
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
            inputDir: `${tmpDir.get()}/input_dir`,
            config: `${tmpDir.get()}/config.json`,
            outputDir: `${tmpDir.get()}/output_dir`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const output = await fs.readFile(
            `${tmpDir.get()}/output_dir/page.html`,
            { encoding: 'utf8' },
        );
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

    it('injects bundle', async () => {
        await fs.mkdir(`${tmpDir.get()}/input_dir`, { recursive: true });
        await fs.mkdir(`${tmpDir.get()}/output_dir`, { recursive: true });

        await fs.writeFile(`${tmpDir.get()}/input_dir/page.html`, `
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

        await fs.writeFile(`${tmpDir.get()}/config.json`, `[]`);

        await fs.writeFile(`${tmpDir.get()}/bundle.js`, '');

        const { code, stdout, stderr } = await run({
            inputDir: `${tmpDir.get()}/input_dir`,
            config: `${tmpDir.get()}/config.json`,
            bundle: `${tmpDir.get()}/bundle.js`,
            outputDir: `${tmpDir.get()}/output_dir`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const output = await fs.readFile(
            `${tmpDir.get()}/output_dir/page.html`,
            { encoding: 'utf8' },
        );
        expect(output).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    <script src="/page.js" async defer></script>
</head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
        `.trim());
    });

    it('injects styles', async () => {
        await fs.mkdir(`${tmpDir.get()}/input_dir`, { recursive: true });
        await fs.mkdir(`${tmpDir.get()}/output_dir`, { recursive: true });

        await fs.writeFile(`${tmpDir.get()}/input_dir/page.html`, `
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
            inputDir: `${tmpDir.get()}/input_dir`,
            config: `${tmpDir.get()}/config.json`,
            outputDir: `${tmpDir.get()}/output_dir`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const output = await fs.readFile(
            `${tmpDir.get()}/output_dir/page.html`,
            { encoding: 'utf8' },
        );
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

    it('injects multiple files', async () => {
        await fs.mkdir(`${tmpDir.get()}/input_dir`, { recursive: true });
        await fs.mkdir(`${tmpDir.get()}/output_dir`, { recursive: true });

        await fs.writeFile(`${tmpDir.get()}/input_dir/foo.html`, `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Foo</h2>
    </body>
</html>
        `.trim());

        await fs.writeFile(`${tmpDir.get()}/input_dir/bar.html`, `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Bar</h2>
    </body>
</html>
        `.trim());

        await fs.mkdir(`${tmpDir.get()}/input_dir/hello`);
        await fs.writeFile(`${tmpDir.get()}/input_dir/hello/world.html`, `
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    </head>
    <body>
        <h2>Hello World</h2>
    </body>
</html>
        `.trim());

        const config: InjectorConfig = [
            { type: 'script', path: '/baz.js' },
        ];
        await fs.writeFile(`${tmpDir.get()}/config.json`,
                JSON.stringify(config, null /* replacer */, 4 /* tabSize */));

        const { code, stdout, stderr } = await run({
            inputDir: `${tmpDir.get()}/input_dir`,
            config: `${tmpDir.get()}/config.json`,
            outputDir: `${tmpDir.get()}/output_dir`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const foo = await fs.readFile(
            `${tmpDir.get()}/output_dir/foo.html`,
            { encoding: 'utf8' },
        );
        expect(foo).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    <script src="/baz.js" async defer></script>
</head>
    <body>
        <h2>Foo</h2>
    </body>
</html>
        `.trim());

        const bar = await fs.readFile(
            `${tmpDir.get()}/output_dir/bar.html`,
            { encoding: 'utf8' },
        );
        expect(bar).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    <script src="/baz.js" async defer></script>
</head>
    <body>
        <h2>Bar</h2>
    </body>
</html>
        `.trim());

        const helloWorld = await fs.readFile(
            `${tmpDir.get()}/output_dir/hello/world.html`,
            { encoding: 'utf8' },
        );
        expect(helloWorld).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Some title</title>
    <script src="/baz.js" async defer></script>
</head>
    <body>
        <h2>Hello World</h2>
    </body>
</html>
        `.trim());
    });

    it('copies input JavaScript bundle for each HTML file', async () => {
        await fs.mkdir(`${tmpDir.get()}/input_dir`, { recursive: true });
        await fs.mkdir(`${tmpDir.get()}/output_dir`, { recursive: true });

        await fs.writeFile(`${tmpDir.get()}/input_dir/page.html`, `
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

        await fs.writeFile(`${tmpDir.get()}/config.json`, `[]`);

        await fs.writeFile(
            `${tmpDir.get()}/bundle.js`, `console.log('Hello, World!');`);

        const { code, stdout, stderr } = await run({
            inputDir: `${tmpDir.get()}/input_dir`,
            config: `${tmpDir.get()}/config.json`,
            bundle: `${tmpDir.get()}/bundle.js`,
            outputDir: `${tmpDir.get()}/output_dir`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const output = await fs.readFile(
            `${tmpDir.get()}/output_dir/page.js`,
            { encoding: 'utf8' },
        );
        expect(output).toBe(`console.log('Hello, World!');`);
    });

    it('passes through non-HTML files', async () => {
        await fs.mkdir(`${tmpDir.get()}/input_dir`, { recursive: true });
        await fs.mkdir(`${tmpDir.get()}/output_dir`, { recursive: true });

        await fs.writeFile(
            `${tmpDir.get()}/input_dir/not-html.txt`,
            'Definitely not an HTML file.',
        );

        const config: InjectorConfig = [
            { type: 'script', path: '/foo.js' },
        ];
        await fs.writeFile(`${tmpDir.get()}/config.json`,
                JSON.stringify(config, null /* replacer */, 4 /* tabSize */));

        const { code, stdout, stderr } = await run({
            inputDir: `${tmpDir.get()}/input_dir`,
            config: `${tmpDir.get()}/config.json`,
            outputDir: `${tmpDir.get()}/output_dir`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const output = await fs.readFile(
            `${tmpDir.get()}/output_dir/not-html.txt`,
            { encoding: 'utf8' },
        );
        expect(output).toBe('Definitely not an HTML file.');
    });

    it('exits with non-zero exit code when injector fails', async () => {
        await fs.mkdir(`${tmpDir.get()}/input_dir`, { recursive: true });
        await fs.mkdir(`${tmpDir.get()}/output_dir`, { recursive: true });

        await fs.writeFile(
            `${tmpDir.get()}/input_dir/page.html`, 'not an HTML document');

        const config: InjectorConfig = [
            { type: 'script', path: '/foo.js' },
        ];
        await fs.writeFile(`${tmpDir.get()}/config.json`,
                JSON.stringify(config, null /* replacer */, 4 /* tabSize */));

        const { code, stdout, stderr } = await run({
            inputDir: `${tmpDir.get()}/input_dir`,
            config: `${tmpDir.get()}/config.json`,
            outputDir: `${tmpDir.get()}/output_dir`,
        });

        expect(code).not.toBe(
            0,
            `Binary unexpectedly succeeded. STDERR:\n${stderr}`,
        );
        expect(stdout).toBe('');
        expect(stderr).toContain('packages/resource_injector/injector.ts');
    });
});
