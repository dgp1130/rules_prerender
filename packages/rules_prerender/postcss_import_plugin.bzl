"""Plugin configuration for `postcss-import`."""

# Load the postcss-import plugin with an IIFE which returns the
# arguments for the plugin. This allows us to do one-off work when the
# plugin is loaded.
PLUGIN_CONFIG = """(() => {
    const { promises: fs } = require('fs');
    const path = require('path');
    const { cwd, env } = require('process');

    // Print extra logs when debugging.
    const debug = env['COMPILATION_MODE'] === 'dbg';

    // Generate a Map<string, string[]> mapping workspace names to their
    // associated paths, including all configurations files might be in.
    const workspaceMapPromise = (async () => {
        // Find all workspaces available to this tool.
        const primaryWorkspaceName = cwd().split('/').slice(-1)[0];
        /**
         * NOTE: "External workspaces" in this context refers to other packages
         * installed from NPM via the `node_repositories()` rule. They are
         * *technically* all under a single workspace (`npm`), but here we're
         * treating each NPM package as a separate external workspace. Will this
         * hard dependency on `npm` bite us in the future? Probably.
         */
        const externalWorkspaceRoot = 'external/npm/';
        const externalWorkspaceNames = (await fs.readdir(externalWorkspaceRoot))
            .filter((workspace) => workspace !== 'node_modules');
        if (debug) {
            console.error(`Primary workspace name: ${primaryWorkspaceName}`);
            console.error(`External workspace names: ${
                externalWorkspaceNames.join(', ')}`);
        }

        // Get all the configurations present in the primary workspace.
        const cfgs = await fs.readdir('bazel-out');
        const primaryWorkspaceRoots = [
            '.',
            ...(cfgs.flatMap((cfg) => [
                `bazel-out/${cfg}/bin`,
                `bazel-out/${cfg}/genfiles`,
            ]))
        ];

        // Build a map of workspace name => possible root directories.
        /** type WorkspaceMap = Map<string, string[]>; */
        const workspaceMap = new Map(Object.entries(Object.assign({}, ...[
            // Map the primary workspace all its configurations.
            { [primaryWorkspaceName]: primaryWorkspaceRoots },

            // Map each external workspace to its single root.
            ...externalWorkspaceNames.map((name) => ({
                [name]: [ `${externalWorkspaceRoot}/${name}` ],
            })),
        ])));

        if (debug) {
            console.error('Workspace root map:');
            for (const [ name, roots ] of workspaceMap) {
                console.error(`${name} => ${roots.join(', ')}`);
            }
        }

        return workspaceMap;
    })();

    // Return the list of arguments to be passed to the postcss-import
    // plugin. See: https://github.com/postcss/postcss-import#options.
    return [
        {
            async resolve(importPath, baseDir, importOptions) {
                if (debug) {
                    console.error(`Resolving \\`${importPath}\\` at \\`${
                        baseDir}\\` with options:`, importOptions);
                }

                // Validate import path.
                if (!importPath.includes('/')) {
                    throw new Error(`Import path \\`${importPath}\\` must be an`
                        + ` absolute path, starting with the workspace name (or`
                        + ` \\`__main__\\` if not set).`);
                }

                const { root } = importOptions;

                // Look up the workspace paths and resolve against them.
                const workspaceMap = await workspaceMapPromise;
                const importWorkspace = importPath.split('/')[0];
                const relativeImport = importPath.split('/')
                    .slice(1).join('/');
                const paths = workspaceMap.get(importWorkspace)
                    .map((importPath) => path.join(root, importPath, relativeImport));

                if (debug) {
                    console.error(`Found possible paths:\\n${
                        paths.map((p) => `  ${p}`).join('\\n')
                    }`);
                }

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

                // Log and return the one result.
                const resolved = existingPaths[0];
                if (debug) {
                    console.error(`Resolved \\`${importPath}\\` to \\`${
                        resolved}\\`.`);
                }

                return resolved;
            },
        },
    ];
})()"""
