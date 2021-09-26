/**
 * @fileoverview Utilities for mocking {@link PrerenderMetadata} models.
 * @see /README.md#Mocking
 */

import { StyleInjection } from 'rules_prerender/common/models/prerender_annotation';
import { PrerenderMetadata, ScriptMetadata, StyleMetadata } from 'rules_prerender/common/models/prerender_metadata';

/** Mocks the {@link PrerenderMetadata} object with the given overrides. */
export function mockPrerenderMetadata(
    overrides: Partial<PrerenderMetadata> = {},
): PrerenderMetadata {
    return {
        scripts: [],
        styles: [],
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

/** Mocks the {@link StyleMetadata} object with the given overrides. */
export function mockStyleMetadata(overrides: Partial<StyleMetadata> = {}):
        StyleMetadata {
    return {
        path: 'path/to/mocked/style.css',
        injection: StyleInjection.Bundle,
        ...overrides,
    };
}
