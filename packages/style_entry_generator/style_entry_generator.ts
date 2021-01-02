import { promises as fs } from 'fs';
import * as yargs from 'yargs';
import { main } from 'rules_prerender/common/binary';
import { mdSpacing } from 'rules_prerender/common/formatters';
import { PrerenderMetadata } from 'rules_prerender/common/models/prerender_metadata';
import { generateEntryPoint } from 'rules_prerender/packages/style_entry_generator/generator';

main(async () => {
    // Parse options and flags.
    const { metadata: metadataFile, output } = yargs
        .usage(mdSpacing(`
            Generates an entry point for all the styles in the given metadata
            file. The entry point is a CSS source file which imports all the
            given styles which can be used as an entry point for various tools.
        `))
        .option('metadata', {
            type: 'string',
            required: true,
            description: mdSpacing(`
                A path to a file containing a \`PrerenderMetadata\` object in
                JSON format. This metadata should contain a \`styles\` property
                which contains all the styles to reference in the output file.
            `),
        })
        .option('output', {
            type: 'string',
            required: true,
            description: mdSpacing(`
                A path to a file which will be written to by this tool,
                containing CSS source of the entry point generated.
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
