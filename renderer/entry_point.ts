import { dynamicImport } from './dynamic_import';

/**
 * Dynamically imports the JavaScript CommonJS module at the given path, invokes
 * the default function export, and validates the result before returning it.
 * 
 * @param entryPoint A path to a JavaScript CommonJS module. This module should
 *     have a default export of a function. This function accepts no arguments
 *     and returns a `string` or a `Promise<string>`. The module is imported
 *     into the NodeJS runtime and invoked, propagating the return value to the
 *     caller.
 */
export async function invoke(entryPoint: string): Promise<string> {
    const module = await dynamicImport(entryPoint);
    if (typeof module !== 'object') {
        throw new Error(`Entry point (${entryPoint}) did not export a CommonJS`
                + ` module, exported:\n${JSON.stringify(module)}`);
    }
    const moduleRecord = module as Record<string, unknown>;
    const defaultExport = moduleRecord['default'];
    if (!defaultExport) {
        throw new Error(`Entry point (${entryPoint}) did not provide a default`
                + ` export:\n${JSON.stringify(module)}`);
    }
    if (typeof defaultExport !== 'function') {
        throw new Error(`Entry point (${entryPoint}) provided a default export`
                + ` that was not a function:\n${defaultExport}`)
    }

    const rendered = await defaultExport() as unknown;
    if (typeof rendered !== 'string') {
        throw new Error(`Entry point (${entryPoint}) provided a default export`
                + ` which returned/resolved a non-string value:\n${
                JSON.stringify(rendered)}`);
    }

    return rendered;
}
