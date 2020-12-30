import { promises as fs } from 'fs';
import * as yargs from 'yargs';
import { main } from 'rules_prerender/common/binary';
import { mdSpacing } from 'rules_prerender/common/formatters';
import { extract } from 'rules_prerender/packages/annotation_extractor/extractor';
import { assembleMetadata } from 'rules_prerender/packages/annotation_extractor/metadata';

main(async () => {
    const {
        'input-html': inputHtml,
        'output-html': outputHtml,
        'output-metadata': outputMetadata,
    } = yargs
        .usage(mdSpacing(`
            Extracts annotations from the given HTML file. Outputs the same HTML
            file with the annotations removed and a JSON file containing the
            extracted annotations.
        `))
        .option('input-html', {
            type: 'string',
            description: mdSpacing(`
                The input HTML file to extract annotations from.
            `),
        })
        .option('output-html', {
            type: 'string',
            description: mdSpacing(`
                The output HTML file to write to. Will be identical to the input
                HTML file, except with annotations removed.
            `),
        })
        .option('output-metadata', {
            type: 'string',
            description: mdSpacing(`
                The output JSON file to write metadata to. Will contain all
                extracted annotations in the \`PrerenderMetadata\` format.
            `),
        })
        .demand([ 'input-html', 'output-html', 'output-metadata' ])
        .argv;

    // Read input HTML file.
    const input = await fs.readFile(inputHtml, { encoding: 'utf8' });

    // Extract annotations from the HTML.
    const [ output, annotations ] = extract(input);

    // Assemble annotations into the metadata format.
    const metadata = assembleMetadata(annotations);

    // Write output HTML and metadata JSON.
    const metadataOutput =
            JSON.stringify(metadata, null /* replacer */, 4 /* tabSize */)
            + `\n` /* trailing newline */;
    await Promise.all([
        fs.writeFile(outputHtml, output),
        fs.writeFile(outputMetadata, metadataOutput),
    ]);

    return 0;
});
