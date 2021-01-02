/**
 * @fileoverview Utilities for mocking {@link PrerenderMetadata} models.
 * @see /README.md#Mocking
 */

import { PrerenderMetadata, ScriptMetadata } from 'rules_prerender/common/models/prerender_metadata';

/** Mocks the {@link PrerenderMetadata} object with the given overrides. */
export function mockPrerenderMetadata(
        overrides: Partial<PrerenderMetadata> = {}): PrerenderMetadata {
    return {
        scripts: [],
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
