import * as fs from 'rules_prerender/common/fs';
import { parseAnnotation, SsrAnnotation } from 'rules_prerender/common/models/prerender_annotation';
import { ComponentMap } from 'rules_prerender/packages/ssr/component_map';

export { SsrComponent, SsrFactory } from 'rules_prerender/packages/ssr/ssr_component';

const componentMap = new ComponentMap();
export const registerComponent = componentMap.register.bind(componentMap);

// TODO: Accept a path and read from it or just accept a file to begin with?
export async function* render(path: string, params: unknown[]):
        AsyncGenerator<string, void, void> {
    const html = await fs.readFile(path, 'utf8'); // TODO: Binary? Read in chunks?
    yield* preload(parseHtml(html), params);
}

async function* preload(
    chunks: Generator<string | SsrAnnotation, void, void>,
    params: unknown[],
): AsyncGenerator<string, void, void> {
    // Pull all the chunks into memory to start SSR execution in parallel.
    const loadingChunks = Array.from(chunks).map((chunk) => {
        if (typeof chunk === 'string') {
            return chunk;
        } else {
            return renderComponent(chunk, ...params);
        }
    });

    // Yield the chunks in order now that they've already started loading.
    for (const chunk of loadingChunks) {
        if (typeof chunk === 'string') {
            yield chunk;
        } else {
            yield* chunk;
        }
    }
}

function renderComponent(
    { component, data }: SsrAnnotation,
    ...params: unknown[]
): AsyncGenerator<string, void, void> {
    const comp = componentMap.resolve<unknown[]>(component, data);
    if (!comp) {
        throw new Error(`Failed to resolve component "${component}", was it registered?`);
    }
    return normalize(comp.render(...params));
}

/** TODO */
async function* normalize<T>(
    input: T | Promise<T> | Generator<T, void, void> | AsyncGenerator<T, void, void>,
): AsyncGenerator<T, void, void> {
    if (typeof input === 'string') {
        yield input; // Special case string, which is technically `Iterable`.
    } else if (input instanceof Promise) {
        yield await input;
    } else if (isIterable(input)) { // TODO: Doesn't match renderer's implementation?
        yield* input as Generator<T, void, void>;
    } else if (isAsyncIterable(input)) {
        yield* input as AsyncGenerator<T, void, void>;
    } else {
        yield input;
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

// TODO: Something more sophisticated?
function* parseHtml(html: string):
        Generator<string | SsrAnnotation, void, void> {    
    const annotationExtractor =
        /<!--(?<annotation> *bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - [^\n]*)-->/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null = null;
    while ((match = annotationExtractor.exec(html)) !== null) {
        // Emit previous prerendered chunk.
        yield html.slice(lastIndex, match.index);

        // Parse annotation and emit it.
        const annotationText = match.groups?.['annotation'] as string;
        const annotation = parseAnnotation(annotationText);
        if (!annotation) {
            throw new Error(`Failed to parse annotation: ${
                annotationText} at index ${match.index}-${
                annotationExtractor.lastIndex}`);
        }
        if (annotation.type !== 'ssr') {
            throw new Error(`Found a non-SSR annotation: ${annotationText}.`);
        }
        yield annotation;
        lastIndex = annotationExtractor.lastIndex;
    }

    // Emit final prerendered chunk.
    yield html.slice(lastIndex);
}
