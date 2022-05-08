import { Resolver } from '@parcel/plugin';
import * as path from 'path';

declare global {
    // eslint-disable-next-line no-var
    var parcelBazelResolverImportMap: ReadonlyMap<string, string> | undefined;
}

/** TODO */
export default new Resolver({
    async resolve({ specifier, dependency, options: { projectRoot } }) {
        if (path.isAbsolute(specifier)) return { filePath: specifier };

        console.error(`Trying to resolve \`${specifier}\` from \`${
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            dependency.sourcePath!}\` in project \`${projectRoot}\``); // DEBUG
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const relPath = path.relative(projectRoot, path.join(dependency.sourcePath!, '../', specifier));
        console.error(`Relative path of target: ${relPath}`); // DEBUG
        const wksp = path.basename(projectRoot);
        console.error(`Root workspace: ${wksp}`); // DEBUG
        const importPath = path.join(wksp, relPath);
        console.error(`Trying: ${importPath}`); // DEBUG

        if (!globalThis.parcelBazelResolverImportMap) {
            throw new Error(`parcelBazelResolverImportMap not set.`);
        }

        const resolved = globalThis.parcelBazelResolverImportMap.get(importPath);
        if (!resolved) throw new Error(`Failed to resolve: \`${specifier}\`.`);
        
        return { filePath: path.join(projectRoot, resolved) };
    },
});
