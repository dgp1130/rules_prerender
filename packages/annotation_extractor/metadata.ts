import { PrerenderAnnotation } from 'rules_prerender/common/models/prerender_annotation';
import { PrerenderMetadata, ScriptMetadata } from 'rules_prerender/common/models/prerender_metadata';

/**
 * Converts the provided {@link Set} of {@link PrerenderAnnotation} into a
 * {@link PrerenderMetadata} object with the same information.
 * 
 * @param annotations The set of annotations to convert from.
 * @returns The {@link PrerenderAnnotation} object converted to.
 */
export function assembleMetadata(annotations: Set<PrerenderAnnotation>):
        PrerenderMetadata {
    // Manually type metadata so it is mutable.
    const metadata = {
        scripts: [] as ScriptMetadata[],
    };

    // Add each annotation to its relevant place in the metadata object.
    for (const annotation of annotations) {
        const { type } = annotation;
        switch (type) {
            case 'script': {
                metadata.scripts.push({
                    path: annotation.path,
                });
                break;
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
    }

    return metadata;
}

function assertNever(value: never): never {
    throw new Error(`Expected never type but got: ${value}`);
}
