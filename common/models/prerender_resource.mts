import { SafeHtml, isSafeHtml } from '../safe_html/safe_html.mjs';
import { UrlPath } from './url_path.mjs';

/** Represents a resource to be rendered / generated at a particular path. */
export class PrerenderResource {
    private readonly urlPath: UrlPath;

    /** The file contents of the resource. */
    public readonly contents: ArrayBuffer;

    private constructor({ urlPath, contents }: {
        urlPath: UrlPath,
        contents: ArrayBuffer,
    }) {
        this.urlPath = urlPath;
        this.contents = contents;
    }

    /** The URL path of the resource. */
    public get path(): string {
        return this.urlPath.path;
    }

    /**
     * Returns a `PrerenderResource` representing a file with the provided
     * {@param contents} at the given {@param path} within the site.
     * 
     * @param path The path the file will be generated at relative to the final
     *     generated site. Must begin with a `/` character.
     * @param contents A {@link SafeHtml}, {@link ArrayBuffer}, or
     *     {@link TypedArray} object with the file contents of the resource. If
     *     {@link SafeHtml} is given, it is encoded as a UTF-8 string. If an
     *     {@link ArrayBuffer} or {@link TypedArray} is given, it used as is.
     * @returns A `PrerenderResource` object representing the resource.
     */
    public static of(path: string, contents: string | SafeHtml | ArrayBuffer | TypedArray):
            PrerenderResource {
        return new PrerenderResource({
            urlPath: UrlPath.of(path),
            contents: normalizeContents(contents),
        });
    }
}

/**
 * Accepts various input types and normalizes them to a simple
 * {@link ArrayBuffer} representing the input content. If the input is a
 * {@link SafeHtml}, it will be encoded as a UTF-8 string. If the input is an
 * {@link ArrayBuffer} or a {@link TypedArray}, its content is used as is.
 * 
 * NOTE: {@link TypedArray} does **not** extend {@link ArrayBuffer}, however
 * they are unfortunately compatible from a structural typing perspective, so
 * TypeScript allows a {@link Uint8Array} in place of an {@link ArrayBuffer},
 * even though something like `instanceof ArrayBuffer` would return `false`.
 * This is an easy foot-gun for users to encounter, so we should support such
 * inputs as a result.
 */
function normalizeContents(contents: string | SafeHtml | ArrayBuffer | TypedArray):
        ArrayBuffer {
    if (contents instanceof ArrayBuffer) return contents;
    if (typeof contents === 'string') {
        return new TextEncoder().encode(contents).buffer;
    }
    if (isTypedArray(contents)) return contents.buffer;
    if (isSafeHtml(contents)) {
        return new TextEncoder().encode(contents.getHtmlAsString()).buffer;
    }

    // Should never happen if TypeScript types are respected, but JavaScript
    // users or unsound input types may hit this case.
    throw new Error(
        `Input is not a \`SafeHtml\`, \`ArrayBuffer\`, or \`TypedArray\`:\n${
            contents}`,
    );
}

/**
 * Returns whether or not the given value is a `TypedArray`.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
 */
function isTypedArray(input: unknown): input is TypedArray {
    return ArrayBuffer.isView(input);
}

/**
 * Define non-built-in `TypedArray` type.
 * 
 * @see https://github.com/microsoft/TypeScript/issues/15402#issuecomment-297544403
 */
type TypedArray =
    Int8Array
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Uint8ClampedArray
    | Float32Array
    | Float64Array;
