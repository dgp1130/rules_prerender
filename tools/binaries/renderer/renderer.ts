import { promises as fs } from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
import type { MainFn } from '../../../common/binary';
import { mdSpacing } from '../../../common/formatters';
import { invoke } from './entry_point';

// Cannot include a value reference of `rules_prerender` because the user will
// depend on it via the `npm_link_package()` in their own workspace, not the
// `@rules_prerender//:node_modules/rules_prerender` dependency we use for type
// checking.
import type * as RulesPrerender from 'rules_prerender';

/**
 * Creates the renderer's main function for the binary. We accept
 * `rulesPrerender` as input parameter instead of importing it because we want
 * the `//:node_modules/rules_prerender` dependency in the _user's_ workspace,
 * not the `@rules_prerender` workspace.
 */
export function createRenderer(
    rulesPrerender: typeof RulesPrerender,
    entryModule: unknown,
    entryPoint: string,
): MainFn {
    const {
        PrerenderResource,
        internalSetInlineStyleMap,
        InternalInlineStyleNotFoundError,
    } = rulesPrerender;

    return async (args: string[]) => {
        // Parse binary options and arguments.
        const {
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
            .parse(args);

        // Pass through `--inline-style-import` and `--inline-style-path` flags as the
        // inline style map to be looked up by `inlineStyle()` calls.
        internalSetInlineStyleMap(new Map(zip(inlineStyleImports, inlineStylePaths)));

        // Invoke the provided entry point.
        let resources: Awaited<ReturnType<typeof invoke>>;
        try {
            resources = await invoke(entryModule, entryPoint);
        } catch (err) {
            console.error((err as Error).message);
            return 1;
        }

        // Write each resource to its file.
        const generatedUrlPaths = new Set<string>();
        const writes = [] as Promise<void>[];
        try {
            for await (const resource of resources) {
                // Assert the user yielded a `PrerenderResource`.
                if (!(resource instanceof PrerenderResource)) {
                    throw new Error(`Expected default export to yield \`PrerenderResource\` objects, but instead got a \`${resource.constructor.name}\`.`);
                }

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
            if (!(err instanceof InternalInlineStyleNotFoundError)) throw err;

            // Give a nicer error message for `InlineStyleNotFoundErrors`.
            console.error(`
Inline style "${err.importPath}" was not in the inline style map. Did you forget to depend on it in \`styles\`? CSS files available to inline are:

${err.availableImportPaths.join('\n')}
            `.trim());
            return 1;
        }

        await Promise.all(writes);

        return 0;
    };
}

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
