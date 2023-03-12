/**
 * Serializes an annotation and returns it, should be rendered directly into
 * prerendered HTML for the build process to use.
 * 
 * @param annotation The annotation to convert to a string.
 * @return The annotation expressed as a string where it can be easily parsed by
 *     tooling.
 */
export function serialize(annotation: PrerenderAnnotation): string {
    return JSON.stringify(annotation, null, 4);
}

/**
 * Parse an annotation from HTML text content. The input must **not** contain
 * the leading or trailing `<rules_prerender:annotation>` tag of the HTML
 * element.
 * 
 * @param content The text content to parse an annotation from.
 * @returns The parsed annotation.
 * @throws If the parsed annotation does not contain valid JSON. This is
 *     indicative of an annotation creation error, so this is effectively an
 *     assertion error.
 */
export function deserialize(content: string): PrerenderAnnotation {
    return JSON.parse(content) as PrerenderAnnotation;
}

/**
 * Returns whether or not two annotations are equivalent.
 * 
 * @param first The first annotation to compare.
 * @param second The second annotation to compare.
 * @returns Whether or not {@param first} and {@param second} are equivalent and
 *     represent the same annotation.
 */
export function annotationsEqual(
    first: PrerenderAnnotation,
    second: PrerenderAnnotation,
): boolean {
    if (first.type !== second.type) return false;

    switch (first.type) {
        case 'script': {
            const sec = second as ScriptAnnotation;
            if (first.path !== sec.path) return false;
            return true;
        } case 'style': {
            const sec = second as StyleAnnotation;
            if (first.path !== sec.path) return false;
            return true;
        } default: {
            return assertNever(first);
        }
    }
}

/**
 * An annotation to be used by the build process to include external resources
 * in the final generated HTML page.
 */
export type PrerenderAnnotation = ScriptAnnotation | StyleAnnotation;

/**
 * An annotation of a JavaScript resource to be included in the final generated
 * HTML page.
 */
export interface ScriptAnnotation {
    readonly type: 'script';

    /** A path to the JavaScript file to include. */
    readonly path: string;
}

/**
 * An annotation of a CSS resource to be included in the final generated HTML
 * page.
 */
export interface StyleAnnotation {
    readonly type: 'style';

    /** A path to the CSS file to include. */
    readonly path: string;
}

function assertNever(value: never): never {
    throw new Error(`Expected never type but got: ${value}`);
}
