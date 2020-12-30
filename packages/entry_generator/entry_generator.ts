import { promises as fs } from 'fs';
import * as yargs from 'yargs';
import { main } from 'rules_prerender/common/binary';
import { PrerenderMetadata } from 'rules_prerender/common/models/prerender_metadata';
import { generateEntryPoint } from 'rules_prerender/packages/entry_generator/generator';

main(async () => {
    // Parse options and flags.
    const { metadata: metadataFile, output } = yargs
        .usage(formatOptionDoc(`
            Generates an entry point for all the scripts in the given metadata
            file. The entry point is a TypeScript source file which
            side-effectfully imports all the given scripts which can be used as
            an entry point for tools like Rollup, which expect direct references
            to all top-level scripts.
        `))
        .option('metadata', {
            type: 'string',
            required: true,
            description: formatOptionDoc(`
                A path to a file containing a \`PrerenderMetadata\` object in
                JSON format. This metadata should contain a \`scripts\` property
                which contains all the scripts to reference in the output file.
            `),
        })
        .option('output', {
            type: 'string',
            required: true,
            description: formatOptionDoc(`
                A path to a file which will be written to by this tool,
                containing TypeScript source of the entry point generated.
            `),
        })
        .argv;

    // Read metadata JSON file.
    const metadataText = await fs.readFile(metadataFile, { encoding: 'utf8' });
    const metadata = JSON.parse(metadataText) as PrerenderMetadata;

    // Generate an entry point from metadata.
    const entryPoint = generateEntryPoint(metadata);

    // Write the entry point to the output file.
    await fs.writeFile(output, entryPoint);

    return 0;
});

function formatOptionDoc(doc: string): string {
    return doc.trim().split('\n')
            .map((line) => line.trimStart())
            .join(' ');
}
