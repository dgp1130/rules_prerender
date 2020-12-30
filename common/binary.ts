/** @fileoverview Utilities for building Node binaries. */

/**
 * Executes an asynchronous "main" function. This serves as an entry point for a
 * NodeJS binary which executes asynchronous operations. Top-level await is not
 * totally supported yet, so this serves a simple replacement which gives users
 * access to an `async` function and will properly handle errors. The main file
 * of a NodeJS binary should simply be a call to `main`.
 * 
 * @param impl The "main" function of this program. Resolves with the exit code
 *     of the program. If this rejects, the error is printed to stderr and the
 *     program exits with code 1.
 */
export function main(impl: (args: string[]) => Promise<number>): void {
    const result = impl(process.argv.slice(2)).catch((err) => {
        const message = err.stack ?? err.message ?? err;
        console.error(message);
        return 1;
    }).then((code) => {
        process.exit(code);
    });

    // @ts-ignore Return promise for testing purposes but don't document this in
    // the type because it shouldn't be used normally.
    return result;
}
