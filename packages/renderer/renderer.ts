import { promises as fs } from 'fs';
import * as yargs from 'yargs';

import { invoke } from './entry_point';

async function main(): Promise<number> {
    // Parse binary options and arguments.
    const {
        'entry-point': entryPoint,
        output,
    } = yargs
        .option('entry-point', {
            type: 'string',
            description: formatOptionDoc(`
                The entry point to render the template. Should be a path to a
                JavaScript file which has a CommonJS default export of a
                function which takes no arguments and returns a page as a string
                or a \`Promise<string>\`.
            `),
        })
        .option('output', {
            type: 'string',
            description: formatOptionDoc(`
                The path to the output file to write the rendered result to.
            `),
        })
        .demand([ 'entry-point', 'output' ])
        .argv;

    const rendered = await invoke(entryPoint);
    await fs.writeFile(output, rendered);

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