import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    plugins: [
        // Needed to support absolute imports.
        nodeResolve({ browser: true }),
    ],

    // Fail the build on any warning.
    onwarn(warning) {
        if (warning.code === 'EMPTY_BUNDLE') {
            // Give a better suggestion when no JavaScript is generated.
            console.warn('Generated an empty JavaScript bundle, do you have'
                + ' any JavaScript? If not, consider setting'
                + ' `bundle_js = False` on your `prerender_pages()` to skip'
                + ' this step.\n\n' + warning.message);
            return;
        }

        throw new Error(warning.message);
    },
};
