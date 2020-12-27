/**
 * Creates an annotation comment and returns it, should be rendered directly
 * into prerendered HTML for the build process to use.
 * 
 * @param annotation The annotation to convert to a string.
 * @return The annotation expressed as a string where it can be easily parsed by
 *     tooling.
 */
export function createAnnotation(annotation: PrerenderAnnotation): string {
    return `<!-- bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE - ${
            JSON.stringify(annotation)} -->`;
}

/**
 * An annotation to be used by the build process to include external resources
 * in the final generated HTML page.
 */
export type PrerenderAnnotation = ScriptAnnotation;

/**
 * An annotation of a JavaScript resource to be included in the final generated
 * HTML page.
 */
interface ScriptAnnotation {
    type: 'script';

    /** A path to the JavaScript file to include. */
    path: string;
}
