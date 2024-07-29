declare global {
    // eslint-disable-next-line no-var
    var __rulesPrerenderUrl__: string | undefined;
}

/**
 * Throws an error if this `rules_prerender` package is the second one executed
 * at runtime.
 *
 * Any given tool should only have a single copy of `rules_prerender` in it.
 * Specifically, we usually want the version which the user got from their
 * `npm install` which exists at `@user//:node_modules/rules_prerender`.
 * However, it is easy to accidentally depend on
 * `@rules_prerender//:node_modules/rules_prerender`, which is a different
 * target and duplicates the content. This duplication can cause errors and
 * should not be possible.
 *
 * We check for this by looking for a unique global and then immediately setting
 * it. If it is already set, we know this function already ran in a separate
 * execution of a different `rules_prerender` package, therefore we throw an
 * error.
 */
export function checkForDuplicateExecution(): void {
    if (globalThis.__rulesPrerenderUrl__) {
        throw new Error(`
\`rules_prerender\` was loaded twice, which should never happen. Did two copies of the library get bundled together?

First load: ${globalThis.__rulesPrerenderUrl__}
Second load: ${import.meta.url}
        `.trim());
    }

    globalThis.__rulesPrerenderUrl__ = import.meta.url;
}
