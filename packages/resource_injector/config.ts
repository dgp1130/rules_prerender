/**
 * @fileoverview Types representing the configuration JSON of for the resource
 * injector.
 */

/** The top-level type of the configuration JSON object. */
export type InjectorConfig = InjectorAction[];

/** A discriminated union of the various injections to be performed. */
export type InjectorAction = InjectScript;

/** An action to inject a `<script />` tag with the given path. */
export interface InjectScript {
    type: 'script';

    /** The path to use for the `src` attribute. */
    path: string;
}
