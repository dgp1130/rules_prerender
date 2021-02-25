import { promises as fs } from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
import { main } from 'rules_prerender/common/binary';
import { mdSpacing } from 'rules_prerender/common/formatters';
import { invoke } from 'rules_prerender/packages/renderer/entry_point';

main(async () => {
    // Parse binary options and arguments.
    const {
        'entry-point': entryPoint,
        'output-dir': outputDir,
    } = yargs
        .option('entry-point', {
            type: 'string',
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
            description: mdSpacing(`
                The path to the output directory to write the rendered files to
                at their specified paths.
            `),
        })
        .demand([ 'entry-point', 'output-dir' ])
        .argv;

    // Invoke the provided entry point.
    let resources: PromiseValue<ReturnType<typeof invoke>>;
    try {
        resources = await invoke(entryPoint);
    } catch (err) {
        console.error(err.message);
        return 1;
    }

    // Write each resource to its file.
    const generatedUrlPaths = new Set<string>();
    const writes = [] as Promise<void>[];
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

    await Promise.all(writes);

    return 0;
});

// Extracts the generic value type from an input `Promise`.
type PromiseValue<T extends Promise<unknown>> =
    T extends Promise<infer V> ? V : never;
