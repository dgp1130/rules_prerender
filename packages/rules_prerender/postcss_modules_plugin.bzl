"""Plugin configuration for `postcss-modules`."""

# Load the postcss-modules plugin with an IIFE which returns the arguments for
# the plugin. This allows us to do one-off work when the plugin is loaded.
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
            // resolve `./bar.css` as a module.
            await fs.writeFile(`${baseName}.css.ts`, tsContent);
        }
    }];
})()"""
