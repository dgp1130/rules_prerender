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

    /**
     * "Re-roots" the given {@link ResourceMap} by moving all its contents under
     * the given root path. For example, re-rooting a {@link ResourceMap} of:
     * /foo.txt
     * /bar/baz.txt
     * 
     * At `/test`, will result in a {@link ResourceMap} of:
     * /test/foo.txt
     * /test/bar/baz.txt
     * 
     * @param root New directory all contents should be moved under. Must start
     *     with a slash and must **not** end with a slash.
     * @param map The map to re-root.
     */
    public static reRoot(root: string, map: ResourceMap): ResourceMap {
        // Disallow roots ending with a slash or else re-rooted paths would have
        // extra slashes between file names.
        if (root.endsWith('/')) {
            throw new Error(`New root must not end with a slash: ${root}`);
        }

        return ResourceMap.fromEntries(
            Array.from(map.entries()).map(([ urlPath, fileRef ]) => [
                `${root}${urlPath}`, // urlPath
                fileRef, // fileRef
            ]),
        );
    }

    /**
     * Merges all the given {@link ResourceMap} objects into a single instance.
     * Does not modify any URL path or file reference, simply puts them in the
     * same map.
     * 
     * @param resources {@link ResourceMap} objects to merge into a single
     *     {@link ResourceMap}.
     * @throws When multiple {@link ResourceMap} objects have a file at the same
     *     URL path.
     */
    public static merge(...resources: ResourceMap[]): ResourceMap {
        const entries = resources.map((res) => Array.from(res.entries()))
            .reduce((res1, res2) => [ ...res1, ...res2 ], []);
        
        for (const [ first, second ] of nonEquivalentPairs(entries)) {
            const [ firstUrlPath, firstFileRef ] = first;
            const [ secondUrlPath, secondFileRef ] = second;

            if (firstUrlPath === secondUrlPath) {
                throw new Error(`
Found URL path conflict. \`${firstUrlPath}\` maps to both:
  ${firstFileRef}
**and**
  ${secondFileRef}
                `.trim());
            }
        }
    
        return ResourceMap.fromEntries(entries);
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

/**
 * Returns an {@link Iterable} of all the various pairs of the input, excluding
 * pairs of the same item in both slots.
 */
function* nonEquivalentPairs<T>(items: T[]): Iterable<[ T, T ]> {
    for (const [ index, first ] of items.entries()) {
        for (const second of items.slice(index + 1)) {
            yield [ first, second ];
        }
    }
}
