import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    plugins: [
        // Needed to support absolute imports.
        nodeResolve({ browser: true }),
    ],

    // Fail the build on any warning.
    onwarn(warning) {
        // Ignore some warnings we don't care about.
        if (ignoredWarnings.includes(warning.code)) return;

        throw new Error(warning.message);
    },
};

const ignoredWarnings = [
    // If no scripts are included, then the bundle will be empty.
    'EMPTY_BUNDLE',
];
