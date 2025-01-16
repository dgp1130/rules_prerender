/**
 * @fileoverview Utilities for mocking {@link PrerenderMetadata} models.
 * @see /README.md#Mocking
 */

import { PrerenderMetadata, ExternalScriptMetadata } from './prerender_metadata.mjs';

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

/** Mocks the {@link ExternalScriptMetadata} object with the given overrides. */
export function mockScriptMetadata(overrides: Partial<ExternalScriptMetadata> = {}):
        ExternalScriptMetadata {
    return {
        path: 'path/to/mocked/script',
        ...overrides,
    };
}
