/**
 * Recursive data type of route labels which map to either a URL to navigate to
 * or a list of child routes to expand.
 */
export interface Route {
    /** The text to display to the user. */
    readonly label: string;

    /** Either a link to a page, or a list of nested routes to expand. */
    readonly content: string | Route[];
}
