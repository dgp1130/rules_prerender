import { dynamicImport } from './dynamic_import';
import { PrerenderResource } from 'rules_prerender/common/models/prerender_resource';

/**
 * Dynamically imports the JavaScript CommonJS module at the given path, invokes
 * the default function export, and validates the result before returning it.
 * 
 * @param entryPoint A path to a JavaScript CommonJS module. This module should
 *     have a default export of a function with the type:
 * 
 *     ```
 *     () => Iterable<PrerenderResource> | Promise<Iterable<PrerenderResource>>
 *         | AsyncIterable<PrerenderResource>
 *     ```
 * 
 *     The module is imported into the NodeJS runtime and invoked, propagating
 *     the return value to the caller.
 * @returns The returned value of the invoked entry point.
 */
export async function invoke(entryPoint: string): Promise<
    | Iterable<PrerenderResource>
    | AsyncIterable<PrerenderResource>
> {
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
                + ` that was not a function:\n${defaultExport}`);
    }

    const rendered = await defaultExport() as unknown;
    if (isIterable(rendered)) {
        return rendered as Iterable<PrerenderResource>;
    }
    if (isAsyncIterable(rendered)) {
        return rendered as AsyncIterable<PrerenderResource>;
    }

    throw new Error(`Entry point (${entryPoint}) provided a default export`
        + ` which returned a value that is not one of:\n${[
            'Iterable<PrerenderResource>',
            'Promise<Iterable<PrerenderResource>>',
            'AsyncIterable<PrerenderResource>',
        ].join('\n')}\n\nInstead, got:\n${JSON.stringify(rendered)}`);
}

function isIterable(input: unknown): input is Iterable<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((input as any)[Symbol.iterator]) return true;
    return false;
}

function isAsyncIterable(input: unknown): input is AsyncIterable<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((input as any)[Symbol.asyncIterator]) return true;
    return false;
}
