/** Metadata about a prerendered HTML file. */
export interface PrerenderMetadata {
    /** Map of HTML relative path to a list of scripts it includes. */
    readonly includedScripts: Record<string /* htmlRelPath */, ScriptMetadata[]>;
}

/** Metadata for a script to be included in a prerendered HTML file. */
export interface ScriptMetadata {
    /** The path of the script to include. */
    readonly path: string;
}
