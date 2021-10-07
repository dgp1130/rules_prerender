import * as fs from 'rules_prerender/common/fs';
import { parseAnnotation, SsrAnnotation } from 'rules_prerender/common/models/prerender_annotation';
import { ComponentMap } from 'rules_prerender/packages/ssr/component_map';

const componentMap = new ComponentMap();
export const registerComponent = componentMap.register.bind(componentMap);

// TODO: Accept a path and read from it or just accept a file to begin with?
export async function* render(path: string):
        AsyncGenerator<string, void, void> {
    const html = await fs.readFile(path, 'utf8'); // TODO: Binary? Read in chunks?
    const chunks = parseHtml(html);
    for (const chunk of chunks) {
        if (typeof chunk === 'string') {
            yield chunk;
        } else {
            const { component, data } = chunk;
            const comp = componentMap.resolve(component, data);
            if (!comp) {
                throw new Error(`Failed to resolve component "${component}", was it registered?`);
            }
            yield comp.render();
        }
    }
}

// TODO: Something more sophisticated?
const annotationExtractor =
    /<!--(?<annotation> *bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - [^\n]*)-->/g;
function* parseHtml(html: string):
        Generator<string | SsrAnnotation, void, void> {
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
