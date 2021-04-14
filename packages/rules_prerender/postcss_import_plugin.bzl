"""Plugin configuration for `postcss-import`."""

# Load the postcss-import plugin with an IIFE which returns the
# arguments for the plugin. This allows us to do one-off work when the
# plugin is loaded.
PLUGIN_CONFIG = """(() => {
    const { promises: fs } = require('fs');
    const { env } = require('process');

    // Print extra logs when debugging.
    const debug = env['COMPILATION_MODE'] === 'dbg';

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

    // Return the list of arguments to be passed to the postcss-import
    // plugin. See: https://github.com/postcss/postcss-import#options.
    return [
        {
            root: workspaceRoot,
            async resolve(importPath, baseDir, importOptions) {
                const workspaceMap = await workspaceMapPromise;
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

                // Look up the workspace paths and resolve against them.
                const importWorkspace = importPath.split('/')[0];
                const relativeImport = importPath.split('/')
                    .slice(1).join('/');
                const moduleImport =
                    relativeImport.split('.').slice(0, -1).join('.')
                    + '.module.css';
                const workspacePaths = workspaceMap.get(importWorkspace)
                    .map((path) => `${importWorkspace}/${path}`);
                // TODO: Just module imports?
                const paths = workspacePaths.flatMap((path) => [
                    `${importOptions.root}/${path}/${relativeImport}`,
                    `${importOptions.root}/${path}/${moduleImport}`,
                ]);

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
