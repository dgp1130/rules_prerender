import * as acorn from 'acorn';
import * as escodegen from 'escodegen';
import { promises as fs } from 'fs';
import * as path from 'path';
import yargs from 'yargs';
import { main } from '../../../common/binary.mjs';
import { mdSpacing } from '../../../common/formatters.mjs';
import { ExternalScriptMetadata, InlineScriptMetadata, PrerenderMetadata } from '../../../common/models/prerender_metadata.mjs';
import { generateEntryPoint } from './generator.mjs';

void main(async (args) => {
    // Parse options and flags.
    const { metadata: metadataFile, outputDir, root } = yargs(args)
        .strict()
        .usage(mdSpacing(`
            Generates an entry point for all the scripts in the given metadata
            file. The entry point is a TypeScript source file which
            side-effectfully imports all the given scripts which can be used as
            an entry point for tools like Rollup, which expect direct references
            to all top-level scripts.
        `))
        .option('metadata', {
            type: 'string',
            demandOption: true,
            description: mdSpacing(`
                A path to a file containing a \`PrerenderMetadata\` object in
                JSON format. This metadata should contain a \`scripts\` property
                which contains all the scripts to reference in the output file.
            `),
        })
        .option('output-dir', {
            type: 'string',
            demandOption: true,
            description: mdSpacing(`
                Path to a directory where the entry points will be written to.
            `),
        })
        .option('root', {
            type: 'string',
            default: process.cwd(),
            description: mdSpacing(`
                Root directory of all source files. Defaults to CWD. Only set
                for testing purposes.
            `),
        })
        .parseSync();

    // Read metadata JSON file.
    const metadataText = await fs.readFile(metadataFile, { encoding: 'utf8' });
    const metadata = JSON.parse(metadataText) as PrerenderMetadata;

    // Compute the import depth of the output directory relative to the current
    // working directory which should always be in the root of the bin dir.
    const relativeOutputDirPath = (await fs.realpath(outputDir))
        .slice(`${path.normalize(root)}/`.length);
    const outputDirDepth = relativeOutputDirPath.split('/').length;

    // Generate an entry point from metadata. `await` all the `Promises` at the end
    // so they run with max parallelism.
    const operations: Array<Promise<void>> = [];
    for (const [ htmlRelPath, scripts ] of Object.entries(metadata.includedScripts)) {
        // Don't generate entry points for HTML files which don't include any scripts.
        if (scripts.length === 0) continue;

        const inlineScripts = scripts
            .filter((script): script is InlineScriptMetadata => script.type === 'inline-script');
        const externalScripts = scripts
            .filter((script): script is ExternalScriptMetadata => script.type === 'external-script');
        if (inlineScripts.length + externalScripts.length < scripts.length) {
            const uniqueTypes = new Set(scripts.map((script) => script.type));
            throw new Error(`Dropped some scripts, is there a new type?\n${
                Array.from(uniqueTypes.values()).join('\n')}`);
        }

        // Hash each inline script and map it to a synthetic output file.
        const inlineScriptData = await Promise.all(inlineScripts.map(async (script) => {
            const hash = await digest(script.code);

            // Inline scripts are hosted in a subdirectory.
            const importDepth = outputDirDepth + 1;

            return {
                hash,
                path: `/__rp_inline_scripts__/${script.key}.js`,
                code: rebaseImports(script.code, importDepth),
            };
        }));

        // Write the inline scripts to a synthetic file.
        for (const script of inlineScriptData) {
            operations.push((async () => {
                // TODO: Unnecessary? These will all be the same path?
                const outputPath = path.join(outputDir, script.path);
                await fs.mkdir(path.dirname(outputPath), { recursive: true });
                await fs.writeFile(outputPath, script.code);
            })());
        }

        // Reference the synthetic files as if they were external scripts.
        const inlineScriptsAsExternalScripts: ExternalScriptMetadata[] =
            inlineScriptData.map((script) => ({
                type: 'external-script',
                path: path.join(outputDir, script.path),
            }));

        operations.push((async () => {
            const jsRelPath = htmlRelPath.split('.').slice(0, -1).join('.') + '.js';
            const jsRelDepth = jsRelPath.split('/')
                .filter((part) => part !== '.' && part !== '')
                .length - 1;
            const fileDepth = outputDirDepth + jsRelDepth;
            const jsOutputPath = path.join(outputDir, jsRelPath);

            const scripts = [...externalScripts, ...inlineScriptsAsExternalScripts];
            const entryPoint = generateEntryPoint(scripts, fileDepth);
            await fs.mkdir(path.dirname(jsOutputPath), { recursive: true });
            await fs.writeFile(jsOutputPath, entryPoint);
        })());
    }

    await Promise.all(operations);

    return 0;
});

async function digest(content: string): Promise<string> {
    const binaryContent = new TextEncoder().encode(content);
    const buffer = await crypto.subtle.digest('SHA-256', binaryContent);
    return Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

// TODO: Rewrite dynamic `import`.
/** Rewrite workspace-relative import specifiers to be resolvable by the bundler. */
function rebaseImports(code: string, importDepth: number): string {
    let ast: acorn.Program;
    try {
        ast = acorn.parse(code, {
            ecmaVersion: 'latest',
            sourceType: 'module',
        });
    } catch (err) {
        throw new Error(`Failed to parse JavaScript:\n\n${code}`, { cause: err });
    }

    for (const stmt of ast.body) {
        if (stmt.type === 'ImportDeclaration') {
            const prefix = range(importDepth).map(() => '..').join('/');
            stmt.source.value = path.normalize(`${prefix}/${stmt.source.value}`);
        }
    }

    return escodegen.generate(ast);
}

// Like the Python `range()` function.
function range(max: number): number[] {
    return [...Array(max).keys()];
}
