import * as fs from 'rules_prerender/common/fs';
import { parseAnnotation, SsrAnnotation } from 'rules_prerender/common/models/prerender_annotation';
import { ComponentMap } from 'rules_prerender/packages/ssr/component_map';
import { SsrComponent } from 'rules_prerender/packages/ssr/ssr_component';

export { SsrComponent, SsrFactory } from 'rules_prerender/packages/ssr/ssr_component';

const componentMap = new ComponentMap();
export const registerComponent = componentMap.register.bind(componentMap);

// TODO: Accept a path and read from it or just accept a file to begin with?
export async function* render(path: string, ctx: unknown):
        AsyncGenerator<string, void, void> {
    const html = await fs.readFile(path, 'utf8'); // TODO: Binary? Read in chunks?
    yield* preload(parseHtml(html), ctx);
}

async function* preload(
    chunks: Generator<string | SsrAnnotation, void, void>,
    ctx: unknown,
): AsyncGenerator<string, void, void> {
    // Pull all the chunks into memory to start SSR execution in parallel.
    const loadingChunks = Array.from(chunks).map((chunk) => {
        if (typeof chunk === 'string') {
            return chunk;
        } else {
            return renderComponent(chunk, ctx);
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

function renderComponent({ component, data }: SsrAnnotation, ctx: unknown):
        AsyncGenerator<string, void, void> {
    const comp = componentMap.resolve<unknown>(component, data);
    if (!comp) {
        throw new Error(`Failed to resolve component "${component}", was it registered?`);
    }
    return normalize(comp.render(ctx));
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

export function parseOnlySlot<Context = unknown>(slot: string):
        SsrComponent<Context> {
    const chunks = Array.from(parseHtml(slot));
    const annotations =
        chunks.filter((chunk) => typeof chunk !== 'string') as SsrAnnotation[];
    if (annotations.length === 0) {
        throw new Error(`Found no slots in content:\n${slot}`);
    } else if (annotations.length > 1) {
        throw new Error(`Found multiple slots in content:\n${slot}`);
    }

    return {
        // TODO: Handle async, generators, etc.
        render: (ctx: Context): string => {
            const textChunks = chunks.map((chunk) => {
                if (typeof chunk === 'string') {
                    return chunk;
                } else {
                    const { component, data } = chunk;
                    const ssrComponent = componentMap.resolve(component, data);
                    if (!ssrComponent) throw new Error(`Failed to resolve component: "${component}".`);
                    return ssrComponent.render(ctx);
                }
            });
            return textChunks.join('');
        },
    };
}

const templateOpenTag = `<template label=bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE>`;
const templateCloseTag = '</template>';
function* parseHtml(html: string):
        Generator<string | SsrAnnotation, void, void> {
    while (true) {
        const openIndex = html.search(templateOpenTag);
        if (openIndex === -1) {
            yield html; // Trailing chunk.
            return;
        }

        yield html.slice(0, openIndex); // Leading chunk.
        html = html.slice(openIndex); // Move `html` to first `<template>`.

        // How many layers of templates we are currently nested under.
        let nestCount = 0;

        // The remaining HTML to parse and its index in the input html.
        let remainingHtmlIndex = 0;
        let remainingHtml = html;
        while (true) {
            // Find the next open or close tag.
            const nextOpenIndex = remainingHtml.search(templateOpenTag);
            const nextCloseIndex = remainingHtml.search(templateCloseTag);

            // eslint-disable-next-line no-inner-declarations
            function isOpenTag(): boolean {
                if (nextOpenIndex === -1 && nextCloseIndex === -1) {
                    throw new Error(`Failed to find closing \`</template>\` tag in ${html}.`);
                } else if (nextCloseIndex === -1) {
                    return true; // Only found an open tag.
                } else if (nextOpenIndex === -1) {
                    return false; // Only found a close tag.
                } else if (nextOpenIndex < nextCloseIndex) {
                    return true; // Found both, close tag is first.
                } else {
                    return false; // Found both, and close tag is first.
                }
            }

            if (isOpenTag()) {
                nestCount++;

                const templateContentStart = nextOpenIndex + templateOpenTag.length;
                remainingHtmlIndex += templateContentStart;
                remainingHtml = remainingHtml.slice(templateContentStart);
            } else {
                nestCount--;

                const templateEnd = nextCloseIndex + templateCloseTag.length;
                remainingHtmlIndex += templateEnd;
                remainingHtml = remainingHtml.slice(templateEnd);
            }
    
            if (nestCount === 0) {
                // Matched the close tag to the original open tag. The whole
                // thing is a single template.

                // `html` already starts at `<template>...`
                const templateStart = 0;
                // `remainingHtml` has parsed the whole `<template>...</template>`.
                const templateEnd = remainingHtmlIndex;

                // Extract the content.
                const templateContentStart = templateStart + templateOpenTag.length;
                const templateContentEnd = templateEnd - templateCloseTag.length;
                const annotationContent = html.slice(templateContentStart, templateContentEnd);

                // Parse the annotation.
                const annotation = parseAnnotation(annotationContent.trim());
                if (annotation.type !== 'ssr') {
                    throw new Error(`Unexpected non-ssr annotation: ${annotationContent}`);
                }
                yield annotation;

                // Continue parsing from the end of this template.
                html = html.slice(templateEnd);
                break;
            }
        }
    }
}
