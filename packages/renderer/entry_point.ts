import { PrerenderResource } from '../../common/models/prerender_resource';

/**
 * Invokes the default function export of the given CommonJS module, and validates the
 * result before returning it.
 * 
 * @param module A JavaScript CommonJS module export. This should come directly from a
 *     `require()` call like so:
 *     
 *     ```javascript
 *     invoke(require('./some/module.js'), './some/module.js');
 *     ```
 * 
 *     The default export should match the following TypeScript type:
 * 
 *     ```
 *     declare function defaultExport():
 *         | Iterable<PrerenderResource>
 *         | Promise<Iterable<PrerenderResource>>
 *         | AsyncIterable<PrerenderResource>;
 *     ```
 * @param entryPoint The file path of the `module` parameter. Used for error messages.
 * @returns The returned value of the invoked entry point.
 */
export async function invoke(module: unknown, entryPoint: string): Promise<
    | Iterable<PrerenderResource>
    | AsyncIterable<PrerenderResource>
> {
    // Get the default export of the given module. In a CommonJS-authored module,
    // it will be a function directly. In certain TypeScript compile modes, it
    // will be an object with a `default` property containing the function.
    const defaultExport = getDefaultExport(module, entryPoint);
    if (typeof defaultExport !== 'function') {
        throw new Error(`Entry point (${entryPoint}) provided a default export`
                + ` that was not a function:\n${defaultExport}`);
    }

    // Invoke the default export and assert the result.
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

function getDefaultExport(module: unknown, entryPoint: string): unknown {
    switch (typeof module) {
        case 'object': {
            const moduleRecord = module as Record<string, unknown>;
            const defaultExport = moduleRecord['default'];
            if (!defaultExport) {
                throw new Error(`Entry point (${entryPoint}) did not provide a default`
                        + ` export:\n${JSON.stringify(module)}`);
            }

            return defaultExport;
        } case 'function': {
            return module;
        } default: {
            throw new Error(`Entry point (${entryPoint}) did not export a CommonJS`
                    + ` module, exported:\n${JSON.stringify(module)}`);
        }
    }
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
