"""Plugin configuration for `postcss-modules`."""

# Load the postcss-modules plugin with an IIFE which returns the arguments for
# the plugin. This allows us to do one-off work when the plugin is loaded.
PLUGIN_CONFIG = """(() => {
    const { promises: fs } = require('fs');
    const LoaderCore = require('css-modules-loader-core');

    // CWD is in the primary workspace under the execroot. The execroot contains
    // all workspaces with files in this execution.
    const workspaceRoot = '..';

    // Generate a Map<string, string[]> mapping workspace names to their
    // associated paths, including all configurations files might be in.
    const workspaceMapPromise = (async () => {
        // Find all workspaces available to this tool.
        const workspaces = await fs.readdir(workspaceRoot);

        // Find all roots within each workspace.
        return new Map(await Promise.all(workspaces.map(
            // Read all directories under `bazel-out/`.
            (workspace) => fs.readdir(`${workspaceRoot}/${workspace}/bazel-out`)
                .then((cfgs) => [
                    // Map the workspace to all its roots.
                    workspace,
                    [
                        '.', // Source root.
                        // The `bin/` and `genfiles/` paths under each
                        // configuration in the workspace.
                        ...cfgs.map((cfg) => `bazel-out/${cfg}`)
                            .flatMap((cfg) => [
                                `${cfg}/bin`,
                                `${cfg}/genfiles`,
                            ]),
                    ],
                ]),
        )));
    })();

    class BazelLoader {
        constructor(root, plugins) {
            this.loaderCore = new LoaderCore(plugins);
            this.tokenMap = new Map();
        }

        async fetch(importPathWithQuotes, relativeTo) {
            const importPath = importPathWithQuotes.slice(1, -1);
            const workspaceMap = await workspaceMapPromise;

            const cachedTokens = this.tokenMap.get(importPath);
            if (cachedTokens) return cachedTokens;

            // Validate import path.
            if (!importPath.includes('/')) {
                throw new Error(`Import path \\`${importPath}\\` must be an`
                    + ` absolute path, starting with the workspace name (or`
                    + ` \\`__main__\\` if not set).`);
            }

            // Look up the workspace paths and resolve against them.
            const importWorkspace = importPath.split('/')[0];
            const relativeImport = importPath.split('/')
                .slice(1).join('/');
            const moduleImport =
                relativeImport.split('.').slice(0, -1).join('.')
                + '.module.css';
            const workspacePaths = workspaceMap.get(importWorkspace)
                .map((path) => `${importWorkspace}/${path}`);
            const paths = workspacePaths.flatMap((path) => [
                `${workspaceRoot}/${path}/${relativeImport}`,
                `${workspaceRoot}/${path}/${moduleImport}`,
            ]);

            // Check if any of the possible files exists.
            const files = await Promise.allSettled(paths.map(
                (path) => fs.access(path).then(() => path),
            ));
            const existingPaths = files
                .filter(({ status }) => status === 'fulfilled')
                .map(({ value }) => value);

            // If a non-one amount of files are found, something is wrong.
            if (existingPaths.length === 0) {
                throw new Error(`Could not resolve \\`${importPath}\\` to`
                    + ` any of:\\n${paths.join('\\n')}`);
            } else if (existingPaths.length > 1) {
                throw new Error(`Resolved \\`${importPath}\\` to multiple`
                    + ` possible files:\\n${
                        existingPaths.map((p) => `  ${p}`).join('\\n')
                    }`);
            }

            // Read the imported file's contents.
            const resolved = existingPaths[0];
            const content = await fs.readFile(resolved, { encoding: 'utf8' });

            // TODO: Load the dependency `ts_library()` targets and propagate
            // their exports?

            // Process the file and get its exported tokens.
            const { exportTokens } = await this.loaderCore.load(
                content,
                importPath,
                undefined /* trace */,
                this.fetch.bind(this),
            );
            this.tokenMap.set(importPath, exportTokens);
            return exportTokens;
        }
    }

    return [{
        Loader: BazelLoader,

        async getJSON(cssFileName, json, outputFileName) {
            // Drop `.module.css` suffix.
            const baseName = outputFileName.split('.').slice(0, -2).join('.');

            // Generate a TypeScript file which exports the obfuscated CSS
            // symbols as an object in the default export.
            const tsContent = `
export default {${Object.entries(json).map(([ className, obfuscatedName ]) => `
    '${className}': '${obfuscatedName}',
`.trimEnd()).join('')}
};
            `.trim() + '\\n';

            // Write the file with a `.css.ts` extension, so TypeScript will
            // resolve `./bar.css` as a module.
            await fs.writeFile(`${baseName}.css.ts`, tsContent);
        },
    }];
})()"""
