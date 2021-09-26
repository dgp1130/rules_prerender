import { StyleInjection } from 'rules_prerender/common/models/prerender_annotation';

/** Metadata about a prerendered HTML file. */
export interface PrerenderMetadata {
    /** Scripts to include. */
    readonly scripts: readonly ScriptMetadata[];

    /** Styles to include. */
    readonly styles: readonly StyleMetadata[];
}

/** Metadata for a script to be included in a prerendered HTML file. */
export interface ScriptMetadata {
    /** The path of the script to include. */
    readonly path: string;
}

/** Metadata for a style to be included in a prerendered HTML file. */
export interface StyleMetadata {
    /** The path of the style to include. */
    readonly path: string;

    /** The injection strategy for this CSS file. */
    readonly injection: StyleInjection;
}
