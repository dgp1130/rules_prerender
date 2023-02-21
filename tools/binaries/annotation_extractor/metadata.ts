import { PrerenderAnnotation } from '../../../common/models/prerender_annotation';
import { ScriptMetadata } from '../../../common/models/prerender_metadata';

/** TODO */
export function metadataFromPrerenderAnnotations(
    annotations: Set<PrerenderAnnotation>): ScriptMetadata[] {
    return Array.from(annotations.values()).map((annotation) => {
        const { type } = annotation;
        switch (type) {
            case 'script': {
                return {
                    path: annotation.path,
                };
            } case 'style': {
                // Annotation extractor should leave style annotations alone, they
                // shouldn't be included in the metadata at all.
                throw new Error(`
Tried to add styles to \`PrerenderMetadata\`, but styles should be handled elsewhere in
the build pipeline.
                `.trim());
            } default: {
                return assertNever(type);
            }
        }
    });
}

function assertNever(value: never): never {
    throw new Error(`Expected never type but got: ${value}`);
}
