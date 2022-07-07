/** Metadata about a prerendered HTML file. */
export interface PrerenderMetadata {
    /** Scripts to include. */
    readonly scripts: readonly ScriptMetadata[];
}

/** Metadata for a script to be included in a prerendered HTML file. */
export interface ScriptMetadata {
    /** The path of the script to include. */
    readonly path: string;
}
