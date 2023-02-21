import { promises as fs } from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
import { main } from '../../../common/binary';
import { mdSpacing } from '../../../common/formatters';
import { InjectorConfig } from './config';
import { inject } from './injector';

main(async () => {
    // Define command line flags.
    const {
        'input-dir': inputDir,
        config: configFile,
        bundles,
        'output-dir': outputDir,
    } = yargs.usage(mdSpacing(`
            Injects web resources specified by the config file into all the HTML
            files within the input directory and writes them to the same
            relative paths in the output directory. Non-HTML files in the input
            directory are simply copied to the same relative path in the output
            directory without modification.
            
            If \`bundle\` is specified, it will be injected into every HTML file
            output.
        `))
        .option('input-dir', {
            type: 'string',
            demandOption: true,
            description: mdSpacing(`
                Path to the input directory file containing HTML files to inject
                resources into. May also contain non-HTML files which will be
                copied to the output unchanged.
            `),
        })
        .option('config', {
            type: 'string',
            demandOption: true,
            description: mdSpacing(`
                Path to the configuration JSON file containing information about
                the resources to inject. Must match the \`InjectorConfig\` type.
            `),
        })
        .option('bundles', {
            type: 'string',
            description: mdSpacing(`TODO`),
        })
        .option('output-dir', {
            type: 'string',
            demandOption: true,
            description: mdSpacing(`
                Path to the output directory to write the output files to.
            `),
        })
        .argv;

    // Start reading the config file, but don't block on it just yet.
    const configPromise = (async () => {
        const configText = await fs.readFile(configFile, { encoding: 'utf8' });
        return JSON.parse(configText) as InjectorConfig;
    })();

    const operations = [] as Array<Promise<void>>;
    for await (const relPath of listRecursiveFiles(inputDir)) {
        // Ignore non-HTML files by simply copying them to the output directory.
        if (!relPath.endsWith('.html')) {
            // Don't `await` this directly in the `for-await` loop or each copy
            // will be done sequentially. Instead, we start the copy operation
            // but don't block on it to start processing the next file. Only at
            // the end do we wait for all file I/O operations to complete.
            operations.push((async () => {
                const inputPath = path.join(inputDir, relPath);
                const outputPath = path.join(outputDir, relPath);
                await mkParentDir(outputPath);
                await fs.copyFile(inputPath, outputPath);
            })());
            continue;
        }

        // Don't `await` directly in the `for-await` loop or each injection will
        // be done sequentially. Instead, we start the process but don't block
        // on it to start processing the next file. Only at the end do we wait
        // for all file I/O operations to complete.
        operations.push((async () => {
            // Read the HTML input.
            const input = await fs.readFile(path.join(inputDir, relPath), {
                encoding: 'utf8',
            });

            // Wait for the configuration to be read and parsed.
            const inputConfig = await configPromise;

            const bundleRelPath = bundles ? await getBundle(relPath, bundles) : undefined;

            // If there is a bundle, inject a <script /> tag for it.
            const config = !bundleRelPath ? inputConfig : inputConfig.concat({
                type: 'script',
                path: `/${bundleRelPath}`,
            });

            // Inject the requested resources into the HTML content.
            const output = await inject(input, config);

            // Write the output HTML to the corresponding location in the
            // output directory.
            const outputPath = path.join(outputDir, relPath);
            await mkParentDir(outputPath);
            await fs.writeFile(outputPath, output);
        })());
    }

    if (bundles) {
        for await (const bundle of listRecursiveFiles(bundles)) {
            operations.push(fs.copyFile(
                path.join(bundles!, bundle),
                path.join(outputDir, bundle),
            ));
        }
    }

    // Wait for all files to be processed.
    await Promise.all(operations);

    return 0;
});

async function getBundle(htmlRelPath: string, bundlesLocation: string):
        Promise<string | undefined> {
    const jsRelPath = htmlRelPath.split('.').slice(0, -1).join('.') + '.js';
    const jsPath = path.join(bundlesLocation, jsRelPath);

    try {
        await fs.access(jsPath);
        return jsRelPath;
    } catch {
        return undefined;
    }
}

/**
 * Yields all the relative paths to files recursively in the given directory.
 * 
 * @param dir The directory to list files within.
 * @yields The relative path of each file recursively in {@param dir}.
 */
function listRecursiveFiles(dir: string): AsyncIterable<string> {
    /** Define recursive implementation. */
    async function* listRecursiveFilesImpl(relPath: string):
            AsyncIterable<string> {
        const contents = await fs.readdir(path.join(dir, relPath), {
            withFileTypes: true,
        });
        for (const item of contents) {
            const itemPath = path.join(relPath, item.name);
            if (item.isDirectory()) {
                yield* listRecursiveFilesImpl(itemPath);
            } else {
                yield itemPath;
            }
        }
    }

    return listRecursiveFilesImpl(''); // Start the recursion.
}

/** Recursively creates the parent directories of the given path. */
async function mkParentDir(path: string): Promise<void> {
    const parentDir = path.split('/').slice(0, -1).join('/');
    await fs.mkdir(parentDir, { recursive: true });
}
