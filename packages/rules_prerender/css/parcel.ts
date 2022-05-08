import { promises as fs } from 'fs';
import * as yargs from 'yargs';
import { Parcel, createWorkerFarm } from '@parcel/core';
import { MemoryFS } from '@parcel/fs';
import { main } from 'rules_prerender/common/binary';

// TODO: Share declaration.
declare global {
    // eslint-disable-next-line no-var
    var parcelBazelResolverImportMap: ReadonlyMap<string, string> | undefined;
}

main(async () => {
    // Define options.
    const {
        config,
        input: inputs,
        output: outputs,
        'import-map': importMapPath,
    } = yargs.usage(`TODO`)
        .option('config', {
            type: 'string',
            demandOption: true,
            description: `TODO`,
        })
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
        .option('import-map', {
            type: 'string',
            demandOption: true,
            description: `TODO`,
        })
        .argv;

    const workerFarm = createWorkerFarm();
    const memoryFs = new MemoryFS(workerFarm);

    const importMapJson = JSON.parse(await fs.readFile(importMapPath, 'utf-8')) as Record<string, string>;
    globalThis.parcelBazelResolverImportMap = new Map(Object.entries(importMapJson));
    console.error(globalThis.parcelBazelResolverImportMap); // DEBUG

    try {
        await Promise.all(zip(inputs, outputs).map(async ([ input, output ]) => {
            const bundler = new Parcel({
                // TODO: Pass all inputs as entries?
                entries: input,
                config,
                workerFarm,
                outputFS: memoryFs,
            });

            const { bundleGraph } = await bundler.run();
            const bundles = bundleGraph.getBundles();
            if (bundles.length !== 1) {
                throw new Error(`Expected exactly one bundle but got: ${bundles.length}`);
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const bundle = bundles[0]!;
            const contents = await memoryFs.readFile(bundle.filePath);
            await fs.writeFile(output, contents);
        }));
    } finally {
        await workerFarm.end();
    }

    return 0;
});

function zip<First, Second>(firsts: First[], seconds: Second[]): Array<[ First, Second ]> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return firsts.map((first, index) => [ first, seconds[index]! ]);
}
