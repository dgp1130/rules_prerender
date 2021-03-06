/**
 * @fileoverview Utilities for mocking {@link ResourceMap} models.
 * @see /README.md#Mocking
 */

import { UrlPath, FileRef, ResourceMap } from 'rules_prerender/packages/resource_packager/resource_map';
import { Public, unmockedFunc } from 'rules_prerender/common/testing/mocks';

/** Mocks a {@link ResourceMap} object with the given property overrides. */
export function mockResourceMap(overrides: Partial<ResourceMap> = {}):
        ResourceMap {
    const mock = {
        entries: unmockedFunc('ResourceMap.prototype.entries'),
        ...overrides,
    } as Public<ResourceMap>;
    Object.setPrototypeOf(mock, ResourceMap);
    return mock as ResourceMap;
}

/** Mocks a {@link UrlPath} object. */
export function mockUrlPath(): UrlPath {
    return '/mocked/url/path';
}

/** Mocks a {@link FileRef} object. */
export function mockFileRef(): FileRef {
    return 'mocked/file/ref.txt';
}
