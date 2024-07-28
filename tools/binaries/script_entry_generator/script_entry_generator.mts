import { promises as fs } from 'fs';
import * as path from 'path';
import yargs from 'yargs';
import { main } from '../../../common/binary.mjs';
import { mdSpacing } from '../../../common/formatters.mjs';
import { PrerenderMetadata } from '../../../common/models/prerender_metadata.mjs';
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

        operations.push((async () => {
            const jsRelPath = htmlRelPath.split('.').slice(0, -1).join('.') + '.js';
            const jsRelDepth = jsRelPath.split('/')
                .filter((part) => part !== '.' && part !== '')
                .length - 1;
            const fileDepth = outputDirDepth + jsRelDepth;
            const jsOutputPath = path.join(outputDir, jsRelPath);

            const entryPoint = generateEntryPoint(scripts, fileDepth);
            await fs.mkdir(path.dirname(jsOutputPath), { recursive: true });
            await fs.writeFile(jsOutputPath, entryPoint);
        })());
    }

    await Promise.all(operations);

    return 0;
});
