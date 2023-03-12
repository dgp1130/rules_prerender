import { promises as fs } from 'fs';
import * as rulesPrerender from 'rules_prerender';
import { ProcessResult } from '../../../common/testing/binary.mjs';
import { useTempDir } from '../../../common/testing/temp_dir.mjs';
import { serialize } from '../../../common/models/prerender_annotation.mjs';
import { createRenderer } from './renderer.mjs';

/**
 * Invokes the renderer binary. We invoke this in-process instead of spinning up a
 * subprocess because it actually can't run standalone. It needs a generated entry point
 * which links it with user-authored code (`entryModule`). So instead we provide that
 * directly and invoke it in-process.
 */
async function run({ entryModule, entryPoint, outputDir, inlineStyles = new Map() }: {
    entryModule: unknown,
    entryPoint: string,
    outputDir: string,
    inlineStyles?: ReadonlyMap<string, string>,
}): Promise<ProcessResult> {
    let stdout = '';
    spyOn(console, 'log').and.callFake((message) => { stdout += `${message}\n`; });

    let stderr = '';
    spyOn(console, 'error').and.callFake((message) => { stderr += `${message}\n`; });

    // Constructor types of the real and copied `rulesPrerender` types don't
    // exactly match, easier to just cast to `any` than copy them too.
    const render = createRenderer(rulesPrerender as any, entryModule, entryPoint);
    const code = await render([
        '--output-dir', outputDir,
        ...Array.from(inlineStyles.entries()).flatMap(([ importPath, filePath ]) => [
            '--inline-style-import', importPath,
            '--inline-style-path', filePath,
        ]),
    ]);

    return {
        code,
        stdout,
        stderr,
    };
}

const {
    PrerenderResource,
    internalResetInlineStyleMapForTesting,
    inlineStyle,
} = rulesPrerender;

describe('renderer', () => {
    const tmpDir = useTempDir();

    beforeEach(() => {
        internalResetInlineStyleMapForTesting();
    });

    it('renders `Iterable<PrerenderResource>`', async () => {
        const { code, stdout, stderr } = await run({
            entryModule: function* () {
                yield PrerenderResource.of('/foo.html', 'foo');
                yield PrerenderResource.of('/bar.html', 'bar');
                yield PrerenderResource.of('/hello/world.html', 'Hello, World!');
            },
            entryPoint: `./foo.js`,
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
        const { code, stdout, stderr } = await run({
            entryModule: () => {
                return Promise.resolve(function* () {
                    yield PrerenderResource.of('/foo.html', 'foo');
                    yield PrerenderResource.of('/bar.html', 'bar');
                    yield PrerenderResource.of('/hello/world.html', 'Hello, World!');
                }());
            },
            entryPoint: `./foo.js`,
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
        const { code, stdout, stderr } = await run({
            entryModule: async function* () {
                yield PrerenderResource.of('/foo.html', 'foo');
                yield PrerenderResource.of('/bar.html', 'bar');
                yield PrerenderResource.of('/hello/world.html', 'Hello, World!');
            },
            entryPoint: `./foo.js`,
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
        const meta: ImportMeta = {
            url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
        };

        const { code, stdout, stderr } = await run({
            entryModule: async function* () {
                yield PrerenderResource.of('/index.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>Test Page</title>
    </head>
    <body>
        ${inlineStyle('./baz.css', meta)}
    </body>
</html>
                `.trim());
            },
            entryPoint: `./foo.js`,
            outputDir: `${tmpDir.get()}/output`,
            inlineStyles: new Map(Object.entries({
                'path/to/pkg/baz.css': 'hello/world.css',
            })),
        });

        expect(code).toBe(0, `Binary unexpectedly failed. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe('');

        const index = await fs.readFile(
            `${tmpDir.get()}/output/index.html`, 'utf8');
        const expectedAnnotation = serialize({
            type: 'style',
            path: 'hello/world.css',
        });
        expect(index).toBe(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test Page</title>
    </head>
    <body>
        <rules_prerender:annotation>${expectedAnnotation}</rules_prerender:annotation>
    </body>
</html>
        `.trim());
    });

    it('fails from import errors from the entry point', async () => {
        const { code, stdout, stderr } = await run({
            entryModule: 'Hello, World!', // Not a function...
            entryPoint: `./foo.js`,
            outputDir: `${tmpDir.get()}/output`,
        });

        expect(code).toBe(1, `Binary unexpectedly succeeded. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toContain(`./foo.js`);
        expect(stderr).toContain('did not export a CommonJS module');
        
        // No output directory should be created.
        await expectAsync(fs.access(`${tmpDir.get()}/output`)).toBeRejected();
    });

    it('fails when the same path is generated multiple times', async () => {
        const { code, stdout, stderr } = await run({
            entryModule: async function* () {
                yield PrerenderResource.of('/foo.html', 'foo');
            
                // Error: Generating /bar.html twice.
                yield PrerenderResource.of('/bar.html', 'bar');
                yield PrerenderResource.of('/bar.html', 'baz');
            },
            entryPoint: `./foo.js`,
            outputDir: `${tmpDir.get()}/output`,
        });

        expect(code)
            .toBe(1, `Binary unexpectedly succeeded. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toContain('Generated path `/bar.html` twice.');
    });

    it('fails when inlining a style not in the inline style map', async () => {
        const meta: ImportMeta = {
            url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
        };

        const { code, stdout, stderr } = await run({
            entryModule: async function* () {
                yield PrerenderResource.of('/index.html', `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Test Page</title>
                </head>
                <body>
                    ${inlineStyle('./does_not_exist.css', meta)}
                </body>
            </html>
                `.trim());
            },
            entryPoint: `./foo.js`,
            outputDir: `${tmpDir.get()}/output`,
            inlineStyles: new Map(Object.entries({
                'foo/bar/baz.css': 'hello/world.css',
                'some/other/file.css': 'place/with/file.css',
            })),
        });

        expect(code).toBe(1, `Binary unexpectedly succeeded. STDERR:\n${stderr}`);
        expect(stdout).toBe('');
        expect(stderr).toBe(`
Inline style "./does_not_exist.css" resolved to "path/to/pkg/does_not_exist.css", but was not in the inline style map. Did you forget to depend on it in \`styles\`? CSS files available to inline are:

foo/bar/baz.css
some/other/file.css
        `.trim() + '\n');
    });
});
