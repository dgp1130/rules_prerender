/** Metadata about a prerendered HTML file. */
export interface PrerenderMetadata {
    /** Map of HTML relative path to a list of scripts it includes. */
    readonly includedScripts: Record<string /* htmlRelPath */, ScriptMetadata[]>;
}

/** Metadata for a script to be included in a prerendered HTML file. */
export type ScriptMetadata =
    | InlineScriptMetadata
    | ExternalScriptMetadata;

/** TODO */
export interface InlineScriptMetadata {
    /** TODO */
    readonly type: 'inline-script';

    /** TODO */
    readonly code: string;
}

/** TODO */
export interface ExternalScriptMetadata {
    /** TODO */
    readonly type: 'external-script';

    /** The path of the script to include. */
    readonly path: string;
}
