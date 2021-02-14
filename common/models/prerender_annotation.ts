const prefix = 'bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE';

/**
 * Creates an annotation comment and returns it, should be rendered directly
 * into prerendered HTML for the build process to use.
 * 
 * @param annotation The annotation to convert to a string.
 * @return The annotation expressed as a string where it can be easily parsed by
 *     tooling.
 */
export function createAnnotation(annotation: PrerenderAnnotation): string {
    return `${prefix} - ${JSON.stringify(annotation)}`;
}

/**
 * Parse an annotation from HTML comment text. The input must **not** contain
 * the leading `<!--` or trailing `-->` of an HTML comment. Returns `undefined`
 * if the comment does not appear to be an annotation.
 * 
 * @param comment The comment to parse an annotation from.
 * @returns The parsed annotation or `undefined` if the comment does not appear
 *     to be an annotation.
 * @throws If the parsed annotation does not contain valid JSON. This is
 *     indicative of an annotation creation error, so this is effectively an
 *     assertion error.
 */
export function parseAnnotation(comment: string): PrerenderAnnotation|undefined {
    if (!comment.trim().startsWith(prefix)) {
        return undefined;
    }
    const separatorIndex = comment.indexOf('-');
    if (separatorIndex === -1) return undefined;
    const json = comment.substring(separatorIndex + 1).trim();
    return JSON.parse(json) as PrerenderAnnotation;
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
        first: PrerenderAnnotation, second: PrerenderAnnotation): boolean {
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
    type: 'script';

    /** A path to the JavaScript file to include. */
    path: string;
}

/**
 * An annotation of a CSS resource to be included in the final generated HTML
 * page.
 */
export interface StyleAnnotation {
    type: 'style',

    /** A path to the CSS file to include. */
    path: string;
}

function assertNever(value: never): never {
    throw new Error(`Expected never type but got: ${value}`);
}
