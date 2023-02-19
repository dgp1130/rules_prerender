import { promises as fs } from 'fs';
import { bundleAsync } from 'lightningcss';
import * as yargs from 'yargs';
import { main } from '../../../common/binary';
import { mdSpacing } from '../../../common/formatters';

main(async () => {
    const {
        'entry-point': entryPoints = [],
        'output': outputs = [],
    } = yargs
        .usage(mdSpacing(`
            Bundles the given CSS files by resolving and inlining \`@import\`
            statements.

            Zips the \`--entry-point\` and \`--output\` arguments so each entry
            point is bundled and emitted at the corresponding output location.
        `)).option('entry-point', {
            type: 'string',
            array: true,
            description: 'List of CSS entry points to bundle.',
        }).option('output', {
            type: 'string',
            array: true,
            description: 'List of output location to write bundled CSS files to.',
        }).argv;

    if (entryPoints.length !== outputs.length) {
        console.error(`Received different number of \`--entry-point\` (${
            entryPoints.length}) and \`--output\` (${
            outputs.length}) arguments. Expected to receive the same of both.`);
        return 1;
    }

    if (entryPoints.length === 0) {
        console.error(`Received no entry points. Expected at least one.`);
        return 1;
    }

    // Bundle all the CSS files.
    await Promise.all(Array.from(zip(entryPoints, outputs))
        .map(async ([ entryPoint, output ]) => {
            const bundled = await bundleAsync({ filename: entryPoint });
            await fs.writeFile(output, bundled.code);
        }),
    );

    return 0;
});

/**
 * Given two arrays, returns an {@link Iterable} of pairs of the same index.
 * Assumes the two inputs have the same number of items.
 */
function* zip<First, Second>(firsts: First[], seconds: Second[]):
        Iterable<[ First, Second ]> {
    if (firsts.length !== seconds.length) {
        throw new Error(`Zipped arrays must be the same length, got:\n${
            firsts.join(', ')}\n\n${seconds.join(', ')}`);
    }
    for (const [ index, first ] of firsts.entries()) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const second = seconds[index]!;
        yield [ first, second ];
    }
}
