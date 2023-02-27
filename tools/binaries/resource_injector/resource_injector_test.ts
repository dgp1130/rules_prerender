import { promises as fs } from 'fs';
import { InjectorConfig } from './config';
import { execBinary, ProcessResult } from '../../../common/testing/binary';
import { useTempDir } from '../../../common/testing/temp_dir';

const injector = 'tools/binaries/resource_injector/resource_injector.sh';

/** Invokes the resource injector binary. */
async function run({ inputDir, config, bundles, outputDir }: {
    inputDir: string,
    config: string,
    bundles?: string,
    outputDir: string,
}): Promise<ProcessResult> {
    return await execBinary(injector, [
        '--input-dir', inputDir,
        '--config', config,
        ...(bundles ? [ '--bundles', bundles ] : []),
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

    it('injects bundle for page', async () => {
        await fs.mkdir(`${tmpDir.get()}/input_dir`, { recursive: true });
        await fs.mkdir(`${tmpDir.get()}/output_dir`, { recursive: true });
        await fs.mkdir(`${tmpDir.get()}/bundles`, { recursive: true });

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

        await fs.writeFile(`${tmpDir.get()}/bundles/page.js`, '');

        const { code, stdout, stderr } = await run({
            inputDir: `${tmpDir.get()}/input_dir`,
            config: `${tmpDir.get()}/config.json`,
            bundles: `${tmpDir.get()}/bundles`,
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
    <script src="/page.js" type="module" async></script>
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
    <script src="/baz.js" type="module" async></script>
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
    <script src="/baz.js" type="module" async></script>
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
    <script src="/baz.js" type="module" async></script>
</head>
    <body>
        <h2>Hello World</h2>
    </body>
</html>
        `.trim());
    });

    it('skips injecting JS bundle for files without one', async () => {
        await fs.mkdir(`${tmpDir.get()}/input_dir`, { recursive: true });
        await fs.mkdir(`${tmpDir.get()}/output_dir`, { recursive: true });
        await fs.mkdir(`${tmpDir.get()}/bundles`, { recursive: true });

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
        await fs.writeFile(`${tmpDir.get()}/input_dir/other.html`, `
<!DOCTYPE html>
<html>
    <head>
        <title>Some other title</title>
    </head>
    <body>
        <h2>Hello, World!</h2>
    </body>
</html>
        `.trim());

        await fs.writeFile(`${tmpDir.get()}/config.json`, `[]`);

        await fs.writeFile(
            `${tmpDir.get()}/bundles/page.js`, `console.log('Hello, World!');`);

        const { code, stdout, stderr } = await run({
            inputDir: `${tmpDir.get()}/input_dir`,
            config: `${tmpDir.get()}/config.json`,
            bundles: `${tmpDir.get()}/bundles`,
            outputDir: `${tmpDir.get()}/output_dir`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        // Copies bundle for `/page.html`.
        const pageJs = await fs.readFile(
            `${tmpDir.get()}/output_dir/page.js`,
            { encoding: 'utf8' },
        );
        expect(pageJs).toBe(`console.log('Hello, World!');`);

        // Does *not* copy or inject bundle for `/other.html`.
        await expectAsync(fs.access(`${tmpDir.get()}/output_dir/other.js`))
            .toBeRejected();
        const otherHtml = await fs.readFile(
            `${tmpDir.get()}/output_dir/other.html`, 'utf8');
        expect(otherHtml).not.toContain('other.js');
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
        expect(stderr).toContain('tools/binaries/resource_injector/injector.js');
    });
});
