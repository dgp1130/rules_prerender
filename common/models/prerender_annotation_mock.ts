/**
 * @fileoverview Utilities for mocking {@link PrerenderAnnotation} models.
 * @see /README.md#Mocking
 */

import { PrerenderAnnotation, ScriptAnnotation, StyleAnnotation, StyleScope } from 'rules_prerender/common/models/prerender_annotation';

/**
 * Mocks a {@link PrerenderAnnotation} object. Since this type is a
 * discriminated union, this mock picks are arbitrary subtype. As a result, no
 * options are supported, because the shape of the type would completely change
 * based on the chosen subtype. Mock the specific subtype if you care about such
 * data.
 * 
 * @see mockScriptAnnotation
 * @see mockStyleAnnotation
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

/** Mocks a {@link StyleAnnotation} object with the given overrides. */
export function mockStyleAnnotation(overrides: Partial<StyleAnnotation> = {}):
        StyleAnnotation {
    return {
        type: 'style',
        path: 'path/to/mocked/style.css',
        scope: StyleScope.Global,
        ...overrides,
    };
}
