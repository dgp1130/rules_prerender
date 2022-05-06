import { promises as fs } from 'fs';
import * as yargs from 'yargs';
import * as css from '@parcel/css';
import { main } from 'rules_prerender/common/binary';

main(async () => {
    // Define options.
    const { input: inputs, output: outputs } = yargs.usage(`TODO`)
        .option('input', {
            type: 'string',
            array: true,
            demandOption: true,
            description: `TODO`,
        })
        .option('output', {
            type: 'string',
            array: true,
            demandOption: true,
            description: `TODO`,
        })
        .argv;

    await Promise.all(zip(inputs, outputs).map(async ([ input, output ]) => {
        const { code } = css.bundle({
            filename: input,
            // TODO: Sourcemaps.
            // sourceMap: true,
        });

        await fs.writeFile(output, code);
    }));

    return 0;
});

function zip<First, Second>(firsts: First[], seconds: Second[]): Array<[ First, Second ]> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return firsts.map((first, index) => [ first, seconds[index]! ]);
}
