/** @fileoverview TODO */

import * as acorn from 'acorn';
import * as fs from 'fs/promises';
import { LoadHook, ModuleFormat, ResolveHook } from 'module';
import * as path from 'path';
import  * as process from 'process';
import { internalWkspRelative as wkspRelative } from 'rules_prerender';
import { fileURLToPath } from 'url';

const clientScriptsEnv = process.env['CLIENT_SCRIPTS'];
if (clientScriptsEnv === undefined) { // TODO: Don't need dash?
    throw new Error('`${CLIENT_SCRIPTS}` environment variable is required.');
}
const clientScripts = !clientScriptsEnv
    ? new Map()
    : new Map(clientScriptsEnv.split(' ')
        .map((pair) => pair.split('=', 2) as [ string, string ]));

/** TODO */
export const resolve: ResolveHook = async (specifier, context, nextResolve) => {
    const resolved = wkspRelative(new URL(specifier, context.parentURL).href);
    const execrootPath = clientScripts.get(resolved);
    if (!execrootPath) {
        if (context.importAttributes.type === 'symbol-ref') {
            throw new Error(`Failed to find \`${resolved}\`.`); // TODO
        } else {
            // Need to pass through resolutions of non-`symbol-ref` imports
            // because of: https://github.com/nodejs/node/issues/56656
            return await nextResolve(specifier, context);
        }
    }

    // Escaping artifact root.
    const module = path.join(process.cwd(), '../../..', execrootPath);
    const url = new URL(`file://${module}`).href;

    return {
        url,
        format: 'module',
        shortCircuit: true,
    };
};

/** TODO */
export const load: LoadHook = async (url, context, nextLoad) => {
    if (context.importAttributes.type !== 'symbol-ref') {
        return await nextLoad(url, context);
    }

    // TODO: Should this be using `nextLoad`?
    const resolvedPath = fileURLToPath(url);
    const source = await fs.readFile(resolvedPath, 'utf8');

    return {
        format: 'module',
        source: transformToComponentDefs(resolvedPath, source),
        shortCircuit: true,
    };
};

/**
 * Transform a JS file to a file which exports `Definition` objects.
 *
 * Input:
 * ```javascript
 * export const MyComponent = class extends HTMLElement {}
 * export const AnotherComponent = class extends HTMLElement {}
 * ```
 *
 * Output:
 * ```javascript
 * const wkspRelativeSpecifier = 'path/to/original/file.mjs';
 *
 * export const MyComponentDef = {
 *     symbol: 'MyComponent',
 *     wkspRelativeSpecifier,
 * };
 *
 * export const AnotherComponentDef = {
 *     symbol: 'AnotherComponent',
 *     wkspRelativeSpecifier,
 * };
 * ```
 */
function transformToComponentDefs(resolvedPath: string, source: string): string {
    let ast: acorn.Program;
    try {
        ast = acorn.parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
    } catch (err) {
        throw new Error(`Failed to parse JavaScript:\n\n${source}`, { cause: err });
    }

    // Extract all exported symbol names.
    const exportedSymbols = ast.body.flatMap((stmt) => {
        // TODO: Other kinds of exports.
        if (stmt.type !== 'ExportNamedDeclaration') return [];

        const {declaration: exportDecl} = stmt;
        if (!exportDecl) return [];

        // TODO: Other types of declarations.
        if (exportDecl.type !== 'VariableDeclaration') return [];

        return exportDecl.declarations.flatMap((varDecl) => {
            if (varDecl.id.type !== 'Identifier') return [];

            return [varDecl.id.name];
        });
    });

    const wkspRelativeSpecifier = wkspRelative(resolvedPath);

    // Generate the new JavaScript code to use.
    return `
const wkspRelativeSpecifier = '${wkspRelativeSpecifier}';

${exportedSymbols.map((symbol) => `
export const ${symbol}Def = {
    symbol: '${symbol}',
    wkspRelativeSpecifier,
};
`.trim()).join('\n\n')}
    `.trim();
}
