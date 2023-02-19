import { promises as fs } from 'fs';
import * as yargs from 'yargs';
import { main } from '../../../common/binary';
import { mdSpacing } from '../../../common/formatters';
import { PrerenderMetadata } from '../../../common/models/prerender_metadata';
import { generateEntryPoint } from './generator';

main(async () => {
    // Parse options and flags.
    const { metadata: metadataFile, 'import-depth': importDepth, output } = yargs
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
        .option('import-depth', {
            type: 'number',
            demandOption: true,
            description: mdSpacing(`
                Depth of the parent directories this tool is executed in. So if this
                function is run from \`//foo/bar:baz\`, \`--import-depth\` would be 2 for
                \`foo\` and \`bar\`.
            `),
        })
        .option('output', {
            type: 'string',
            demandOption: true,
            description: mdSpacing(`
                A path to a file which will be written to by this tool,
                containing TypeScript source of the entry point generated.
            `),
        })
        .argv;

    // Read metadata JSON file.
    const metadataText = await fs.readFile(metadataFile, { encoding: 'utf8' });
    const metadata = JSON.parse(metadataText) as PrerenderMetadata;

    // Generate an entry point from metadata.
    const entryPoint = generateEntryPoint(metadata, importDepth);

    // Write the entry point to the output file.
    await fs.writeFile(output, entryPoint);

    return 0;
});
