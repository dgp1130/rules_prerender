import * as yargs from 'yargs';

async function main(): Promise<number> {
    const {
        'input-html': inputHtml,
        'output-html': outputHtml,
        'output-annotations': outputAnnotations,
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
        .option('output-annotations', {
            type: 'string',
            description: formatOptionDoc(`
                The output JSON file to write annotations to. Will contain all
                extracted annotations in a structured format.
            `),
        })
        .demand([ 'input-html', 'output-html', 'output-annotations' ])
        .argv;

    console.log(`--input-html=${inputHtml}`);
    console.log(`--output-html=${outputHtml}`);
    console.log(`--output-annotations=${outputAnnotations}`);

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
