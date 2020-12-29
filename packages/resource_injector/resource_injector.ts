import { promises as fs } from 'fs';
import * as yargs from 'yargs';
import { InjectorConfig } from 'rules_prerender/packages/resource_injector/config';
import { inject } from './injector';

async function main(): Promise<number> {
    // Define command line flags.
    const { input: inputFile, config: configFile, output: outputFile } = yargs
        .usage(formatOptionDoc(`
            Injects web resources specified by the config file into the provided
            HTML and writes the output to a new file.
        `))
        .option('input', {
            type: 'string',
            required: true,
            description: formatOptionDoc(`
                Path to the input HTML file to inject resources into.
            `),
        })
        .option('config', {
            type: 'string',
            required: true,
            description: formatOptionDoc(`
                Path to the configuration JSON file containing information about
                the resources to inject. Must match the \`InjectorConfig\` type.
            `),
        })
        .option('output', {
            type: 'string',
            required: true,
            description: formatOptionDoc(`Path to write the output HTML to.`),
        })
        .argv;

    // Read input HTML and configuration JSON from files.
    const [ input, configText ] = await Promise.all([
        fs.readFile(inputFile, { encoding: 'utf8' }),
        fs.readFile(configFile, { encoding: 'utf8' }),
    ]);
    const config = JSON.parse(configText) as InjectorConfig;

    // Inject the resources.
    const output = inject(input, config);

    // Write output file.
    await fs.writeFile(outputFile, output);

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
