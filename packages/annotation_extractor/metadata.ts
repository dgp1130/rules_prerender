import { PrerenderAnnotation } from '../../common/models/prerender_annotation';
import { PrerenderMetadata, ScriptMetadata, StyleMetadata } from '../../common/models/prerender_metadata';

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
        styles: [] as StyleMetadata[],
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
                metadata.styles.push({
                    path: annotation.path,
                });
                break;
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
