import { promises as fs } from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
import { main } from '../../../common/binary';
import { mdSpacing } from '../../../common/formatters';
import { PrerenderMetadata } from '../../../common/models/prerender_metadata';
import { generateEntryPoint } from './generator';

main(async () => {
    // Parse options and flags.
    const {
        metadata: metadataFile,
        'import-depth': importDepth,
        'output-dir': outputDir,
    } = yargs
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
        .option('output-dir', {
            type: 'string',
            demandOption: true,
            description: mdSpacing(`TODO`),
        })
        .argv;

    // Read metadata JSON file.
    const metadataText = await fs.readFile(metadataFile, { encoding: 'utf8' });
    const metadata = JSON.parse(metadataText) as PrerenderMetadata;

    // Generate an entry point from metadata.
    for (const [ htmlRelPath, scripts ] of Object.entries(metadata.includedScripts)) {
        const jsRelPath = htmlRelPath.split('.').slice(0, -1).join('.') + '.js';
        const jsFileDepth = jsRelPath.split('/')
            .filter((part) => part !== '.' && part !== '')
            .length - 1;
        const fileDepth = importDepth + jsFileDepth;
        const jsOutputPath = path.join(outputDir, jsRelPath);

        const entryPoint = generateEntryPoint(scripts, fileDepth);
        await fs.mkdir(path.dirname(jsOutputPath), { recursive: true });
        await fs.writeFile(jsOutputPath, entryPoint);
    }

    return 0;
});
