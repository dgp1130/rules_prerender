import { promises as fs } from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
import { main } from 'rules_prerender/common/binary';
import { mdSpacing } from 'rules_prerender/common/formatters';
import { invoke } from 'rules_prerender/packages/renderer/entry_point';
import { setMap as setInlineStyleMap } from 'rules_prerender/packages/rules_prerender/inline_style_map';
import { InlineStyleNotFoundError } from 'rules_prerender/packages/rules_prerender/styles';

main(async () => {
    // Parse binary options and arguments.
    const {
        'entry-point': entryPoint,
        'output-dir': outputDir,
        'inline-style-import': inlineStyleImports = [],
        'inline-style-path': inlineStylePaths = [],
    } = yargs
        .usage(mdSpacing(`
            Invokes the given entry point which returns \`PrerenderResources\`
            and writes each resource to the relevant location under
            \`--output-dir\`. For any \`inlineStyle()\` calls used by the entry
            point, the import path given is looked up in the inline style map
            defined as "parallel array" of \`--inline-style-import\` and
            \`--inline-style-path\`, where the former is a list of keys and the
            latter is a list of values in the inline style map.
        `))
        .option('entry-point', {
            type: 'string',
            demandOption: true,
            description: mdSpacing(`
                The entry point to render the template. Should be a path to a
                JavaScript file which has a CommonJS default export of a
                function which takes no arguments and returns a
                \`Iterable<PrerenderResource>\`, a
                \`Promise<Iterable<PrerenderResource>>\`, or an
                \`AsyncIterable<PrerenderResource>\`.
            `),
        })
        .option('output-dir', {
            type: 'string',
            demandOption: true,
            description: mdSpacing(`
                The path to the output directory to write the rendered files to
                at their specified paths.
            `),
        })
        .option('inline-style-import', {
            type: 'string',
            array: true,
            description: mdSpacing(`
                A list of inline style import paths to combine with inline style
                file paths. Each import path corresponds to the location a user
                would import the inline style file listed at the same index in the
                \`--inline-style-path\` list.
            `),
        })
        .option('inline-style-path', {
            type: 'string',
            array: true,
            description: mdSpacing(`
                A list of inline style file paths to combine with inline style
                imports. Each file path corresponds to the actual on-disk location
                of the \`--inline-style-import\` at the same index.
            `),
        })
        .argv;

    // Pass through `--inline-style-import` and `--inline-style-path` flags as the
    // inline style map to be looked up by `inlineStyle()` calls.
    setInlineStyleMap(new Map(zip(inlineStyleImports, inlineStylePaths)));

    // Invoke the provided entry point.
    let resources: Awaited<ReturnType<typeof invoke>>;
    try {
        resources = await invoke(entryPoint);
    } catch (err) {
        console.error((err as Error).message);
        return 1;
    }

    // Write each resource to its file.
    const generatedUrlPaths = new Set<string>();
    const writes = [] as Promise<void>[];
    try {
        for await (const resource of resources) {
            // Make sure the given path has not been previously generated.
            if (generatedUrlPaths.has(resource.path)) {
                console.error(`Generated path \`${resource.path}\` twice.`);
                return 1;
            }
            generatedUrlPaths.add(resource.path);

            const outputPath = path.join(outputDir, resource.path);
            const dir = outputPath.split('/').slice(0, -1).join('/');

            // Don't block the loop on write, so I/O operations from multiple
            // resources can run in parallel, instead just queue the Promise and
            // `await` them all at the end.
            writes.push((async () => {
                await fs.mkdir(dir, { recursive: true });
                await fs.writeFile(outputPath, new Uint8Array(resource.contents));
            })());
        }
    } catch (err) {
        if (!(err instanceof InlineStyleNotFoundError)) throw err;

        // Give a nicer error message for `InlineStyleNotFoundErrors`.
        console.error(`
Inline style "${err.importPath}" was not in the inline style map. Did you forget to depend on it in \`inline_styles\`? CSS files available to inline are:

${err.availableImportPaths.join('\n')}
        `.trim());
        return 1;
    }

    await Promise.all(writes);

    return 0;
});

/**
 * Given two arrays, returns an {@link Iterable} of pairs of the same index.
 * Assumes the two inputs have the same number of items.
 */
function* zip<First, Second>(firsts: First[], seconds: Second[]):
        Iterable<[ First, Second ]> {
    if (firsts.length !== seconds.length) {
        throw new Error(`Zipped arrays must be the same length, got:\n${
            firsts.join(', ')}\n\n${seconds.join(', ')}`);
    }
    for (const [ index, first ] of firsts.entries()) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const second = seconds[index]!;
        yield [ first, second ];
    }
}
