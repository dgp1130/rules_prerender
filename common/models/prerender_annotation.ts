import { JsonObject, JsonValue } from 'rules_prerender/common/models/json';

const privateLabel = 'bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE';

/**
 * Creates an annotation comment and returns it, should be rendered directly
 * into prerendered HTML for the build process to use.
 * 
 * @param annotation The annotation to convert to a string.
 * @return The annotation expressed as a string where it can be easily parsed by
 *     tooling.
 */
export function createAnnotation(annotation: PrerenderAnnotation): string {
    return `
<template label=${privateLabel}>
    ${JSON.stringify(escape(annotation), null, 4)}
</template>
    `.trim();
}

function escape(annotation: PrerenderAnnotation): PrerenderAnnotation {
    switch (annotation.type) {
        case 'ssr':
            return {
                ...annotation,
                data: (
                    annotation.data !== undefined
                        ? escapeSsrData(annotation.data)
                        : undefined
                ) as JsonObject,
            };
        default:
            return annotation;
    }
}

function escapeSsrData(data: JsonValue): JsonValue {
    if (data === null) return data; // Ignore `null`.
    if (typeof data !== 'object') return data; // Ignore primitives.

    // Escape each value of an array.
    if (Array.isArray(data)) return data.map((value) => escapeSsrData(value));

    // Must be an object, check if it is a slottable string.
    if (isSlottable(data)) {
        return {
            ...data,
            // TODO: Something more sophisticated.
            // Escape the slottable value by breaking `</template>`. This
            // prevents an HTML parser from seeing a nested template and
            // believing it to be the end of an outer template.
            _value: data._value
                .replace('<template', '<\\\\template')
                .replace('</template>', '<\\\\/template>'),
        };
    }

    // Not a slottable string, escape each property in it.
    return Object.fromEntries(Object.entries(data)
        .map(([ key, value ]) => [ key, escapeSsrData(value) ]));
}

function unescape(annotation: PrerenderAnnotation): PrerenderAnnotation {
    switch (annotation.type) {
        case 'ssr':
            return {
                ...annotation,
                data: (
                    annotation.data !== undefined
                        ? unescapeSsrData(annotation.data)
                        : undefined
                ) as JsonObject,
            };
        default:
            return annotation;
    }
}

function unescapeSsrData(data: JsonValue): JsonValue {
    if (data === null) return data; // Ignore `null`.
    if (typeof data !== 'object') return data; // Ignore primitives.

    // Unescape each value of an array.
    if (Array.isArray(data)) return data.map((value) => unescapeSsrData(value));

    // Must be an object, check if it is a slottable string.
    if (isSlottable(data)) {
        return {
            ...data,
            // Unescape the slottable value by fixing `</template>`. This
            // prevents an HTML parser from seeing a nested template and
            // believing it to be the end of an outer template.
            _value: data._value
                .replace('<\\\\template', '<template')
                .replace('<\\\\/template>', '</template>'),
        };
    }

    // Not a slottable string, escape each property in it.
    return Object.fromEntries(Object.entries(data)
        .map(([ key, value ]) => [ key, unescapeSsrData(value) ]));
}

function isSlottable(value: Record<string, unknown>):
        value is { _brand: string, _value: string } {
    if (typeof value['_brand'] !== 'string') return false;
    if (typeof value['_value'] !== 'string') return false;
    return true;
}

/**
 * Parse an annotation from HTML comment text. The input must **not** contain
 * the leading `<!--` or trailing `-->` of an HTML comment. Returns `undefined`
 * if the comment does not appear to be an annotation.
 * 
 * @param annotation The comment to parse an annotation from.
 * @returns The parsed annotation or `undefined` if the comment does not appear
 *     to be an annotation.
 * @throws If the parsed annotation does not contain valid JSON. This is
 *     indicative of an annotation creation error, so this is effectively an
 *     assertion error.
 */
export function parseAnnotation(annotation: string): PrerenderAnnotation {
    return unescape(JSON.parse(annotation) as PrerenderAnnotation);
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
        } case 'ssr': {
            const sec = second as SsrAnnotation;
            if (first.component !== sec.component) return false;
            // TODO: Better deep equals?
            if (JSON.stringify(first.data) !== JSON.stringify(sec.data)) return false;
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
export type PrerenderAnnotation =
    | ScriptAnnotation
    | StyleAnnotation
    | SsrAnnotation;

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

export interface SsrAnnotation {
    readonly type: 'ssr';

    readonly component: string;

    readonly data?: JsonObject;
}

function assertNever(value: never): never {
    throw new Error(`Expected never type but got: ${value}`);
}
