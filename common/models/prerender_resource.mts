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
     * Returns a {@link PrerenderResource} representing a file with the provided
     * {@param contents} at the given {@param path} within the site.
     * 
     * @param path The path the file will be generated at relative to the final
     *     generated site. Must begin with a `/` character.
     * @param contents A {@link SafeHtml} object to encode as a UTF-8 string.
     * @returns A {@link PrerenderResource} object representing the resource.
     */
    public static of(path: string, contents: SafeHtml): PrerenderResource {
        if (!isSafeHtml(contents)) {
            throw new Error(`Only \`SafeHtml\` objects can be used in \`*.html\` or \`*.htm\` files. Use a rendering engine like \`@rules_prerender/preact\` to render to \`SafeHtml\`.`);
        }

        const binary =
            new TextEncoder().encode(contents.getHtmlAsString()).buffer;
        return new PrerenderResource({
            urlPath: UrlPath.of(path),
            contents: binary,
        });
    }

    /**
     * Returns a {@link PrerenderResource} representing a file with the provided
     * {@param contents} at the given {@param path} within the site.
     * 
     * @param path The path the file will be generated at relative to the final
     *     generated site. Must begin with a `/` character. Must *not* end in 
     *     `.html` or `.htm`. Use {@link PrerenderResource.of} with
     *     {@link SafeHtml} to generate HTML content.
     * @param contents A UTF-8 encoded string to output at the given path.
     * @returns A {@link PrerenderResource} object representing the resource.
     */
    public static fromText(path: string, contents: string): PrerenderResource {
        // Reject outputting `*.html` and `*.htm` files from plain text. There
        // is no general expectation that the input raw string was safely
        // constructed and there could be injection attacks within it.
        if (path.endsWith('.html') || path.endsWith('.htm')) {
            throw new Error(`Cannot generate a \`*.html\` or \`*.htm\` file (${
                path}) from a raw string (this would be unsafe!). HTML content should be rendered to \`SafeHtml\` first, and then written to a file in \`PrerenderResource.of()\`.`);
        }

        return new PrerenderResource({
            urlPath: UrlPath.of(path),
            contents: new TextEncoder().encode(contents).buffer,
        });
    }

    /**
     * Returns a {@link PrerenderResource} representing a file with the provided
     * {@param contents} at the given {@param path} within the site.
     * 
     * @param path The path the file will be generated at relative to the final
     *     generated site. Must begin with a `/` character. Must *not* end in 
     *     `.html` or `.htm`. Use {@link PrerenderResource.of} with
     *     {@link SafeHtml} to generate HTML content.
     * @param contents Binary content to associate with the given path.
     * @returns A {@link PrerenderResource} object representing the resource.
     */
    public static fromBinary(
        path: string,
        contents: ArrayBuffer | TypedArray,
    ): PrerenderResource {
        // Reject outputting `*.html` and `*.htm` files from plain text. There
        // is no general expectation that the input raw string was safely
        // constructed and there could be injection attacks within it.
        if (path.endsWith('.html') || path.endsWith('.htm')) {
            throw new Error(`Cannot generate a \`*.html\` or \`*.htm\` file (${
                path}) from a raw string (this would be unsafe!). HTML content should be rendered to \`SafeHtml\` first, and then written to a file in \`PrerenderResource.of()\`.`);
        }

        return new PrerenderResource({
            urlPath: UrlPath.of(path),
            contents: isTypedArray(contents) ? contents.buffer : contents,
        });
    }
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
