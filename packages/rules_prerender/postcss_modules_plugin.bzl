"""Plugin configuration for `postcss-modules`."""

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
