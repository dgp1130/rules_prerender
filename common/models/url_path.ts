/**
 * Represents the path segment of a web URL. The path always starts with a slash
 * and is validated at construction.
 */
export class UrlPath {
    /** The path represented as a pure string. */
    public readonly path: string;

    private constructor({ path }: { path: string }) {
        this.path = path;
    }

    /**
     * Validates the given path and returns a `UrlPath` object representing that
     * path. Throws an error if the path is not considered valid.
     * 
     * @param path The path to use for the resulting `UrlPath` object. **Must**
     *     start with a `/` character.
     * @returns A `UrlPath` object for the given `path` input.
     */
    public static of(path: string): UrlPath {
        if (!path.startsWith('/')) {
            throw new Error(`UrlPath (${path}) must start with a "/".`);
        }

        return new UrlPath({ path });
    }
}
