/**
 * Represents a mapping of {@link UrlPath} to {@link FileRef}. The contents of
 * the referenced file are associated with the provided absolute path of a URL.
 */
export class ResourceMap {
    private map: Map<UrlPath, FileRef>;
    private constructor({ map }: { map: Map<UrlPath, FileRef> }) {
        this.map = map;
    }

    /**
     * Creates and validates a new {@link ResourceMap} from the given mappings.
     */
    public static fromEntries(entries: Iterable<[ UrlPath, FileRef ]>):
            ResourceMap {
        return new ResourceMap({
            map: validateMap(entries),
        });
    }

    /** Returns all the {@link UrlPath} objects in this map. */
    public urlPaths(): Iterable<UrlPath> {
        return this.map.keys();
    }

    /** Returns all the {@link FileRef} objects in this map. */
    public fileRefs(): Iterable<FileRef> {
        return this.map.values();
    }

    /** Returns all the entries in this map. */
    public entries(): Iterable<[ UrlPath, FileRef ]> {
        return this.map.entries();
    }
}

/**
 * The path component of a URL string. The path must be absolute, meaning it
 * must start with a slash character.
 */
export type UrlPath = string;

/** A path to a file whose contents will be used at the associated path. */
export type FileRef = string;

function validateMap(entries: Iterable<[ UrlPath, FileRef ]>):
        Map<UrlPath, FileRef> {
    const map = new Map(entries);
    for (const urlPath of map.keys()) {
        if (!urlPath.startsWith('/')) {
            throw new Error(
                `URL paths must be absolute (start with a slash), but \`${
                urlPath}\` does not.`);
        }
    }
    return map;
}
