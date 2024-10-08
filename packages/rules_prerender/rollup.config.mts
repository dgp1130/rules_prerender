import { nodeResolve } from '@rollup/plugin-node-resolve';
import { Plugin, RollupOptions } from 'rollup';

/**
 * Deletes any empty output bundles before they are written to disk. This
 * prevents the build process from injecting an empty script onto the page.
 */
const deleteEmptyBundles: Plugin = {
    name: 'delete-empty-bundles',

    // Called right before writing output bundles to disk.
    generateBundle(_options, bundle): void {
        for (const [ key, value ] of Object.entries(bundle)) {
            if (value.type === 'chunk' && value.isEntry && value.code.trim() === '') {
                // Should remove the property altogether from the bundle object.
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete bundle[key];
            }
        }
    },
};

export default {
    plugins: [
        // Needed to support absolute imports.
        nodeResolve({ browser: true }),
        deleteEmptyBundles,
    ],

    // Fail the build on any warning.
    onwarn(warning) {
        if (warning.code === 'EMPTY_BUNDLE') {
            // Ignore empty output errors because the `deleteEmptyBundles`
            // plugin will delete them after the fact. This is not considered a
            // problem and does not need to warn or error.
            return;
        }

        if (warning.code === 'CIRCULAR_DEPENDENCY' &&
            warning.importer?.includes('node_modules/')) {
            // Ignore circular dependencies in `node_modules/`, nothing the
            // application can do about them.
            return;
        }

        throw new Error(warning.message);
    },
} as RollupOptions;
