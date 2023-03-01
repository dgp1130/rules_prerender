/**
 * @fileoverview Utilities for mocking {@link PrerenderMetadata} models.
 * @see /README.md#Mocking
 */

import { PrerenderMetadata, ScriptMetadata } from './prerender_metadata.mjs';

/** Mocks the {@link PrerenderMetadata} object with the given overrides. */
export function mockPrerenderMetadata(
    overrides: Partial<PrerenderMetadata> = {},
): PrerenderMetadata {
    return {
        includedScripts: {
            ...overrides.includedScripts,
        },
        ...overrides,
    };
}

/** Mocks the {@link ScriptMetadata} object with the given overrides. */
export function mockScriptMetadata(overrides: Partial<ScriptMetadata> = {}):
        ScriptMetadata {
    return {
        path: 'path/to/mocked/script',
        ...overrides,
    };
}
