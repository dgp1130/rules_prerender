import * as path from 'path';
import * as fs from 'rules_prerender/common/fs';
import { parseAnnotation, SsrAnnotation } from 'rules_prerender/common/models/prerender_annotation';
import { Branded } from 'rules_prerender/packages/rules_prerender';
import { ComponentMap } from 'rules_prerender/packages/ssr/component_map';
import { SsrComponent } from 'rules_prerender/packages/ssr/ssr_component';

export { Slottable } from 'rules_prerender/packages/rules_prerender';
export { SsrComponent, SsrFactory } from 'rules_prerender/packages/ssr/ssr_component';

const componentMap = new ComponentMap();
export const registerComponent = componentMap.register.bind(componentMap);

// TODO: Accept a path and read from it or just accept a file to begin with?
export async function* render(inputPath: string, ctx: unknown):
        AsyncGenerator<string, void, void> {
    const stat = await fs.stat(inputPath);
    if (!stat.isDirectory() && !stat.isFile()) {
        throw new Error(`Requested page ${inputPath} is not a file or directory.`);
    }
    const filePath =
        stat.isDirectory() ? path.join(inputPath, 'index.html') : inputPath;
    const html = await fs.readFile(filePath, 'utf8'); // TODO: Binary? Read in chunks?
    yield* preload(parseHtml(html), ctx);
}

async function* preload(
    chunks: Generator<string | SsrAnnotation, void, void>,
    ctx: unknown,
): AsyncGenerator<string, void, void> {
    // Pull all the chunks into memory to start SSR execution concurrently.
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

// Wraps a component with a slotted type, meaning one with a render function
// using the same arguments but the return type is collapsed into a
// `Generator<string, void, void>` or an `AsyncGenerator<string, void, void>`
// depending on the async-ness of the real return type. It must be a generator
// because there may be build-time prerendered content to emit before and after
// the SSR component itself.
export type Slotted<Component extends SsrComponent<unknown, unknown[]>> =
    Omit<Component, 'render'> & {
        render(...params: Parameters<Component['render']>):
            ReturnType<Component['render']> extends string
                ? Generator<string, void, void>
                : ReturnType<Component['render']> extends Generator<string, void, void>
                    ? Generator<string, void, void>
                    : ReturnType<Component['render']> extends AsyncGenerator<string, void, void>
                        ? AsyncGenerator<string, void, void>
                        : ReturnType<Component['render']> extends Promise<string>
                            ? AsyncGenerator<string, void, void>
                            : Generator<string, void, void> | AsyncGenerator<string, void, void>
    }
;

// Parse the given slotted content, find the only SSR reference in it, resolve
// that reference, and return a "slotted" version of the component. The
// "slotted" version wraps the SSR component into a generator, which emits all
// the prerendered content in order with the SSR content inserted at the
// appropriate position.
export function parseOnlySlot<Component extends keyof SsrComponentMap>(
    { _value: content }: Branded<Component, string>,
): Slotted<SsrComponentMap[Component][1]> {
    const chunks = Array.from(parseHtml(content));
    const annotations =
        chunks.filter((chunk) => typeof chunk !== 'string') as SsrAnnotation[];
    if (annotations.length === 0) {
        throw new Error(`Found no slots in content:\n${content}`);
    } else if (annotations.length > 1) {
        throw new Error(`Found multiple slots in content:\n${content}`);
    }

    // Resolve the component, but leave the annotation in `chunks` because we
    // need to render the component at the correct point in the sequence.
    const [ annotation ] = annotations;
    const { component, data } = annotation;
    const ssrComponent = componentMap.resolve(component, data);
    if (!ssrComponent) throw new Error(`Failed to resolve component: "${component}".`);

    const result = {
        name: ssrComponent.name,
        render(ctx: unknown, ...params: unknown[]):
                | Generator<string, void, void>
                | AsyncGenerator<string, void, void> {
            const renderedComponent = ssrComponent.render(ctx, ...params);

            // Emit the rendered component in line with its prerendered chunks
            // according to its return type. When we find the annotation in the
            // `chunks` array, we yield the SSR content, since that is the
            // appropriate time.
            if (typeof renderedComponent === 'string') {
                return (function* (): Generator<string, void, void> {
                    for (const chunk of chunks) {
                        if (typeof chunk === 'string') {
                            yield chunk;
                        } else {
                            yield renderedComponent;
                        }
                    }
                })();
            } else if (isIterable(renderedComponent)) {
                return (function* (): Generator<string, void, void> {
                    for (const chunk of chunks) {
                        if (typeof chunk === 'string') {
                            yield chunk;
                        } else {
                            yield* renderedComponent;
                        }
                    }
                })();
            } else if (renderedComponent instanceof Promise) {
                return (async function* (): AsyncGenerator<string, void, void> {
                    for (const chunk of chunks) {
                        if (typeof chunk === 'string') {
                            yield chunk;
                        } else {
                            yield await renderedComponent;
                        }
                    }
                })();
            } else if (isAsyncIterable(renderedComponent)) {
                return (async function* (): AsyncGenerator<string, void, void> {
                    for (const chunk of chunks) {
                        if (typeof chunk === 'string') {
                            yield chunk;
                        } else {
                            yield* renderedComponent;
                        }
                    }
                })();
            } else {
                throw new Error(`Component ${component} returned a value that could not be converted into a generator: ${
                    JSON.stringify(renderedComponent, null, 4)}`);
            }
        },
    };

    return result as unknown as Slotted<SsrComponentMap[Component][1]>;
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
