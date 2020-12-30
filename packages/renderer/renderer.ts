import { promises as fs } from 'fs';
import * as yargs from 'yargs';
import { main } from 'rules_prerender/common/binary';
import { mdSpacing } from 'rules_prerender/common/formatters';
import { invoke } from 'rules_prerender/packages/renderer/entry_point';

main(async () => {
    // Parse binary options and arguments.
    const {
        'entry-point': entryPoint,
        output,
    } = yargs
        .option('entry-point', {
            type: 'string',
            description: mdSpacing(`
                The entry point to render the template. Should be a path to a
                JavaScript file which has a CommonJS default export of a
                function which takes no arguments and returns a page as a string
                or a \`Promise<string>\`.
            `),
        })
        .option('output', {
            type: 'string',
            description: mdSpacing(`
                The path to the output file to write the rendered result to.
            `),
        })
        .demand([ 'entry-point', 'output' ])
        .argv;

    const rendered = await invoke(entryPoint);
    await fs.writeFile(output, rendered);

    return 0;
});
