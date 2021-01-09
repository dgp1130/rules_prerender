import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    plugins: [
        // Needed to support absolute imports.
        nodeResolve({ browser: true }),
    ],

    // Fail the build on any warning.
    onwarn(warning) {
        throw new Error(warning.message);
    },
};
