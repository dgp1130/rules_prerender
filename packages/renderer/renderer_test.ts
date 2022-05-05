import 'jasmine';

import { promises as fs } from 'fs';
import { runfiles } from '@bazel/runfiles';
import { execBinary, ProcessResult } from 'rules_prerender/common/testing/binary';
import { useTempDir } from 'rules_prerender/common/testing/temp_dir';
import { createAnnotation } from 'rules_prerender/common/models/prerender_annotation';

const renderer = runfiles.resolvePackageRelative('renderer_test_binary.sh');

/** Invokes the renderer binary. */
async function run({ entryPoint, outputDir, inlineStyles = new Map() }: {
    entryPoint: string,
    outputDir: string,
    inlineStyles?: ReadonlyMap<string, string>,
}): Promise<ProcessResult> {
    return await execBinary(renderer, [
        '--entry-point', entryPoint,
        '--output-dir', outputDir,
        ...Array.from(inlineStyles.entries()).flatMap(([ importPath, filePath ]) => [
            '--inline-style-import', importPath,
            '--inline-style-path', filePath,
        ]),
    ]);
}

describe('renderer', () => {
    const tmpDir = useTempDir();

    it('renders `Iterable<PrerenderResource>`', async () => {
        await fs.mkdir(`${tmpDir.get()}/rendered`);
        await fs.writeFile(`${tmpDir.get()}/foo.js`, `
// We can't rely on the linker to resolve imports for us. We also don't want to
// rely on the legacy require() patch, so instead we need to manually load the
// runfiles helper and require() the file through it.
const runfiles = require(process.env['BAZEL_NODE_RUNFILES_HELPER']);
const { PrerenderResource } = require(runfiles.resolveWorkspaceRelative('common/models/prerender_resource.js'));

module.exports = function* () {
    yield PrerenderResource.of('/foo.html', 'foo');
    yield PrerenderResource.of('/bar.html', 'bar');
    yield PrerenderResource.of('/hello/world.html', 'Hello, World!');
};
        `.trim());

        const { code, stdout, stderr } = await run({
            entryPoint: `${tmpDir.get()}/foo.js`,
            outputDir: `${tmpDir.get()}/output`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const foo = await fs.readFile(
            `${tmpDir.get()}/output/foo.html`, 'utf8');
        expect(foo).toBe('foo');

        const bar = await fs.readFile(
            `${tmpDir.get()}/output/bar.html`, 'utf8');
        expect(bar).toBe('bar');
            
        const world = await fs.readFile(
            `${tmpDir.get()}/output/hello/world.html`, 'utf8');
        expect(world).toBe('Hello, World!');
    });

    it('renders `Promise<Iterable<PrerenderResource>>`', async () => {
        await fs.mkdir(`${tmpDir.get()}/rendered`);
        await fs.writeFile(`${tmpDir.get()}/foo.js`, `
// We can't rely on the linker to resolve imports for us. We also don't want to
// rely on the legacy require() patch, so instead we need to manually load the
// runfiles helper and require() the file through it.
const runfiles = require(process.env['BAZEL_NODE_RUNFILES_HELPER']);
const { PrerenderResource } = require(runfiles.resolveWorkspaceRelative('common/models/prerender_resource.js'));

module.exports = () => {
    return function* () {
        yield PrerenderResource.of('/foo.html', 'foo');
        yield PrerenderResource.of('/bar.html', 'bar');
        yield PrerenderResource.of('/hello/world.html', 'Hello, World!');
    }();
};
        `.trim());

        const { code, stdout, stderr } = await run({
            entryPoint: `${tmpDir.get()}/foo.js`,
            outputDir: `${tmpDir.get()}/output`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const foo = await fs.readFile(
            `${tmpDir.get()}/output/foo.html`, 'utf8');
        expect(foo).toBe('foo');

        const bar = await fs.readFile(
            `${tmpDir.get()}/output/bar.html`, 'utf8');
        expect(bar).toBe('bar');
            
        const world = await fs.readFile(
            `${tmpDir.get()}/output/hello/world.html`, 'utf8');
        expect(world).toBe('Hello, World!');
    });

    it('renders `AsyncIterable<PrerenderResource>`', async () => {
        await fs.mkdir(`${tmpDir.get()}/output`);
        await fs.writeFile(`${tmpDir.get()}/foo.js`, `
// We can't rely on the linker to resolve imports for us. We also don't want to
// rely on the legacy require() patch, so instead we need to manually load the
// runfiles helper and require() the file through it.
const runfiles = require(process.env['BAZEL_NODE_RUNFILES_HELPER']);
const { PrerenderResource } = require(runfiles.resolveWorkspaceRelative('common/models/prerender_resource.js'));

module.exports = async function* () {
    yield PrerenderResource.of('/foo.html', 'foo');
    yield PrerenderResource.of('/bar.html', 'bar');
    yield PrerenderResource.of('/hello/world.html', 'Hello, World!');
};
        `.trim());

        const { code, stdout, stderr } = await run({
            entryPoint: `${tmpDir.get()}/foo.js`,
            outputDir: `${tmpDir.get()}/output`,
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const foo = await fs.readFile(
            `${tmpDir.get()}/output/foo.html`, 'utf8');
        expect(foo).toBe('foo');

        const bar = await fs.readFile(
            `${tmpDir.get()}/output/bar.html`, 'utf8');
        expect(bar).toBe('bar');
            
        const world = await fs.readFile(
            `${tmpDir.get()}/output/hello/world.html`, 'utf8');
        expect(world).toBe('Hello, World!');
    });

    it('renders mapped inline style paths', async () => {
        await fs.mkdir(`${tmpDir.get()}/output`);
        await fs.writeFile(`${tmpDir.get()}/foo.js`, `
// We can't rely on the linker to resolve imports for us. We also don't want to
// rely on the legacy require() patch, so instead we need to manually load the
// runfiles helper and require() the file through it.
const runfiles = require(process.env['BAZEL_NODE_RUNFILES_HELPER']);
const { PrerenderResource } = require(runfiles.resolveWorkspaceRelative('common/models/prerender_resource.js'));
const { inlineStyle } = require(runfiles.resolveWorkspaceRelative('packages/rules_prerender/styles.js'));

module.exports = async function* () {
    yield PrerenderResource.of('/index.html', \`
<!DOCTYPE html>
<html>
    <head>
        <title>Test Page</title>
    </head>
    <body>
        \${inlineStyle('wksp/foo/bar/baz.css')}
    </body>
</html>
    \`.trim());
};
        `.trim());

        const { code, stdout, stderr } = await run({
            entryPoint: `${tmpDir.get()}/foo.js`,
            outputDir: `${tmpDir.get()}/output`,
            inlineStyles: new Map(Object.entries({
                'wksp/foo/bar/baz.css': 'wksp/hello/world.css',
            })),
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const index = await fs.readFile(
            `${tmpDir.get()}/output/index.html`, 'utf8');
        const expectedAnnotation = createAnnotation({
            type: 'style',
            path: 'wksp/hello/world.css',
        });
        expect(index).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test Page</title>
    </head>
    <body>
        <!-- ${expectedAnnotation} -->
    </body>
</html>
        `.trim());
    });

    it('fails from import errors from the entry point', async () => {
        await fs.mkdir(`${tmpDir.get()}/output`);
        await fs.writeFile(`${tmpDir.get()}/foo.js`, `
module.exports = 'Hello, World!'; // Not a function...
        `.trim());

        const { code, stdout, stderr } = await run({
            entryPoint: `${tmpDir.get()}/foo.js`,
            outputDir: `${tmpDir.get()}/output`,
        });

        expect(code)
            .toBe(1, `Binary unexpectedly succeeded. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toContain(`${tmpDir.get()}/foo.js`);
        expect(stderr).toContain(
            'provided a default export that was not a function');
        
        // No output files should be written.
        const outputFiles = await fs.readdir(`${tmpDir.get()}/output`, {
            withFileTypes: true,
        });
        expect(outputFiles).toEqual([]);
    });

    it('fails when the same path is generated multiple times', async () => {
        await fs.mkdir(`${tmpDir.get()}/output`);
        await fs.writeFile(`${tmpDir.get()}/foo.js`, `
// We can't rely on the linker to resolve imports for us. We also don't want to
// rely on the legacy require() patch, so instead we need to manually load the
// runfiles helper and require() the file through it.
const runfiles = require(process.env['BAZEL_NODE_RUNFILES_HELPER']);
const { PrerenderResource } = require(runfiles.resolveWorkspaceRelative('common/models/prerender_resource.js'));

module.exports = async function* () {
    yield PrerenderResource.of('/foo.html', 'foo');

    // Error: Generating /bar.html twice.
    yield PrerenderResource.of('/bar.html', 'bar');
    yield PrerenderResource.of('/bar.html', 'baz');
};
        `.trim());

        const { code, stdout, stderr } = await run({
            entryPoint: `${tmpDir.get()}/foo.js`,
            outputDir: `${tmpDir.get()}/output`,
        });

        expect(code)
            .toBe(1, `Binary unexpectedly succeeded. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toContain('Generated path `/bar.html` twice.');
    });

    it('fails when inlining a style not in the inline style map', async () => {
        await fs.mkdir(`${tmpDir.get()}/output`);
        await fs.writeFile(`${tmpDir.get()}/foo.js`, `
// We can't rely on the linker to resolve imports for us. We also don't want to
// rely on the legacy require() patch, so instead we need to manually load the
// runfiles helper and require() the file through it.
const runfiles = require(process.env['BAZEL_NODE_RUNFILES_HELPER']);
const { PrerenderResource } = require(runfiles.resolveWorkspaceRelative('common/models/prerender_resource.js'));
const { inlineStyle } = require(runfiles.resolveWorkspaceRelative('packages/rules_prerender/styles.js'));

module.exports = async function* () {
    yield PrerenderResource.of('/index.html', \`
<!DOCTYPE html>
<html>
    <head>
        <title>Test Page</title>
    </head>
    <body>
        \${inlineStyle('wksp/does/not/exist.css')}
    </body>
</html>
    \`.trim());
};
        `.trim());

        const { code, stdout, stderr } = await run({
            entryPoint: `${tmpDir.get()}/foo.js`,
            outputDir: `${tmpDir.get()}/output`,
            inlineStyles: new Map(Object.entries({
                'wksp/foo/bar/baz.css': 'wksp/hello/world.css',
                'wksp/some/other/file.css': 'wksp/place/with/file.css',
            })),
        });

        expect(code).toBe(1, `Binary unexpectedly succeeded. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe(`
Inline style "wksp/does/not/exist.css" was not in the inline style map. Did you forget to depend on it in \`styles\`? CSS files available to inline are:

wksp/foo/bar/baz.css
wksp/some/other/file.css
        `.trim() + '\n');
    });
});
