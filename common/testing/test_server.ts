/** A running test server, which serves the web site under test. */
export interface TestServer {
    /** The host the server is bound to. */
    readonly host: string;

    /** The port the server is bound to. */
    readonly port: number;

    /**
     * The base path resources are listed under. Must always start with a `/`.
     * This does not imply that resources outside the base path cannot or should
     * not be accessed, but it is a helpful shortcut.
     */
    readonly basePath: `/${string}`;
}
