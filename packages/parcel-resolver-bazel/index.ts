/** @fileoverview File needs to be named `parcel-resolver-*` to be accepted by Parcel. */

import { Resolver } from '@parcel/plugin';
import type { FilePath, ResolveResult } from '@parcel/types';

/** TODO */
export default new Resolver({
    async resolve({ specifier }: { specifier: FilePath }): Promise<ResolveResult> {
        console.error(`Resolving \`${specifier}\`...`);
        return { filePath: specifier };
    },
});
