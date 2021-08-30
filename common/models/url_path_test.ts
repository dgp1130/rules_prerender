import 'jasmine';

import { UrlPath } from 'rules_prerender/common/models/url_path';

describe('UrlPath', () => {
    describe('of()', () => {
        it('validates and returns a `UrlPath` object', () => {
            const urlPath = UrlPath.of('/foo/bar/baz.html');

            expect(urlPath.path).toBe('/foo/bar/baz.html');
        });

        it('throws when given an invalid path', () => {
            expect(() => UrlPath.of('foo/bar/baz.html')).toThrowError(
                'UrlPath (foo/bar/baz.html) must start with a "/".');
        });
    });
});
