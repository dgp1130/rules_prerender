/**
 * @fileoverview Utilities for mocking {@link PrerenderAnnotation} models.
 * @see /README.md#Mocking
 */

import { PrerenderAnnotation, ScriptAnnotation } from 'rules_prerender/common/models/prerender_annotation';

/**
 * Mocks a {@link PrerenderAnnotation} object. Since this type is a
 * discriminated union, this mock picks are arbitrary subtype. As a result, no
 * options are supported, because the shape of the type would completely change
 * based on the chosen subtype. Mock the specific subtype if you care about such
 * data.
 * 
 * @see mockScriptAnnotation
 */
export function mockPrerenderAnnotation(): PrerenderAnnotation {
    return mockScriptAnnotation();
}

/** Mocks a {@link ScriptAnnotation} object with the given overrides. */
export function mockScriptAnnotation(overrides: Partial<ScriptAnnotation> = {}):
        ScriptAnnotation {
    return {
        type: 'script',
        path: 'path/to/mocked/script',
        ...overrides,
    };
}
