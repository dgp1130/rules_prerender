import 'jasmine';

import { PrerenderResource } from 'rules_prerender/common/models/prerender_resource';

describe('PrerenderResource', () => {
    describe('of()', () => {
        it('returns a `PrerenderResource` from string data', () => {
            const res = PrerenderResource.of('/foo/bar.html', 'Hello World!');

            expect(res.path).toBe('/foo/bar.html');
            expect(new TextDecoder().decode(res.contents)).toBe('Hello World!');
        });

        it('returns a `PrerenderResource` from binary data', () => {
            const res = PrerenderResource.of(
                '/foo/bar.html', new Uint8Array([ 0, 1, 2, 3 ]));
            
            expect(res.path).toBe('/foo/bar.html');

            const contents = new Uint8Array(res.contents);
            expect(contents.length).toBe(4);
            expect(contents[0]).toBe(0);
            expect(contents[1]).toBe(1);
            expect(contents[2]).toBe(2);
            expect(contents[3]).toBe(3);
        });

        it('returns a `PrerenderResource` with input string re-encoded as UTF-8', () => {
            // The `¢` character is `\xc2\x00\xa2\x00` in UTF-16, which is used
            // for in-memory strings in JS. We expect this to be converted to
            // `\xc2\xa2` (the UTF-8 equivalent), when stored in the `Buffer`.
            const res = PrerenderResource.of('/foo/bar.html', '¢');

            const contents = new Uint8Array(res.contents);
            expect(contents.length).toBe(2);
            expect(contents[0]).toBe(0xc2);
            expect(contents[1]).toBe(0xa2);
        });

        it('throws when given an invalid URL path', () => {
            expect(() => PrerenderResource.of(
                'does/not/start/with/a/slash.ext',
                'Hello, World!',
            )).toThrowMatching(
                (err) => err.message.includes('must start with a "/"'),
            );
        });
    });
});
