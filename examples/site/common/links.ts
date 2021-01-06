/** Link to the `rules_prerender` GitHub repo. */
export const repo = new URL('https://github.com/dgp1130/rules_prerender/');

/**
 * Returns a link to a source file in the `rules_prerender` repo at the given
 * path on the specified branch.
 * 
 * @param path Path to a source file to link to. Must start with a slash.
 *     Relative to the repository root.
 * @param branch The branch to link to, defaults to the mainline branch.
 * @return A {@link URL} object pointing to the specified source file on GitHub.
 */
export function srcLink(path: string, branch: string = 'main'): URL {
    if (!path.startsWith('/')) {
        throw new Error(`Path \`${path}\` must start with a slash.`);
    }

    return new URL(`${repo}blob/${branch}${path}`);
}
