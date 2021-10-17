import { promises as fs } from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
import { main } from 'rules_prerender/common/binary';
import { StyleInjection } from 'rules_prerender/common/models/prerender_annotation';
import { PrerenderMetadata } from 'rules_prerender/common/models/prerender_metadata';

// TODO: Explain.
const workspaceRoot = '..';

main(async () => {
    const { metadata, output } = yargs.usage(`TODO`)
        .option('metadata', {
            type: 'string',
            required: true,
            description: 'TODO',
        })
        .option('output', {
            type: 'string',
            required: true,
            description: 'TODO',
        })
        .argv;
    
    const meta =
        JSON.parse(await fs.readFile(metadata, 'utf8')) as PrerenderMetadata;
    const inlineStyles = meta.styles
        .filter((style) => style.injection === StyleInjection.Inline);

    for (const { path: inputPath } of inlineStyles) {
        const outputPath = path.join(output, inputPath);
        const outputDir = path.normalize(path.join(outputPath, '..'));
        await fs.mkdir(outputDir, { recursive: true });
        await fs.copyFile(path.join(workspaceRoot, inputPath), outputPath);
    }

    return 0;
});
