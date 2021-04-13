"""Plugin configuration for `postcss-modules`."""

# TODO: localsConvention: https://github.com/madyankin/postcss-modules#localsconvention
# TODO: Need to depend on other plugins to scope names?
# https://github.com/madyankin/postcss-modules/blob/master/src/behaviours.js#L1-L4
PLUGIN_CONFIG = """(() => {
    const { promises: fs } = require('fs');

    return [{
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
            // resolve `import * as foo from './bar.css'`.
            await fs.writeFile(`${baseName}.css.ts`, tsContent);
        }
    }];
})()"""
