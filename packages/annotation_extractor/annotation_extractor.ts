import * as yargs from 'yargs';

async function main(): Promise<number> {
    const {
        'input-html': inputHtml,
        'output-html': outputHtml,
        'output-metadata': outputMetadata,
    } = yargs
        .usage(formatOptionDoc(`
            Extracts annotations from the given HTML file. Outputs the same HTML
            file with the annotations removed and a JSON file containing the
            extracted annotations.
        `))
        .option('input-html', {
            type: 'string',
            description: formatOptionDoc(`
                The input HTML file to extract annotations from.
            `),
        })
        .option('output-html', {
            type: 'string',
            description: formatOptionDoc(`
                The output HTML file to write to. Will be identical to the input
                HTML file, except with annotations removed.
            `),
        })
        .option('output-metadata', {
            type: 'string',
            description: formatOptionDoc(`
                The output JSON file to write metadata to. Will contain all
                extracted annotations in the \`PrerenderMetadata\` format.
            `),
        })
        .demand([ 'input-html', 'output-html', 'output-metadata' ])
        .argv;

    console.log(`--input-html=${inputHtml}`);
    console.log(`--output-html=${outputHtml}`);
    console.log(`--output-metadata=${outputMetadata}`);

    return 0;
}

main().catch((err) => {
    console.error(err.message);
    return 1;
}).then((code) => {
    process.exit(code);
});

function formatOptionDoc(doc: string): string {
    return doc.trim().split('\n')
            .map((line) => line.trimStart())
            .join(' ');
}
