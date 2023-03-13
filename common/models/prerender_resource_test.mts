import { safe, SafeHtml } from '../safe_html/safe_html.mjs';
import { PrerenderResource } from './prerender_resource.mjs';

describe('PrerenderResource', () => {
    describe('of()', () => {
        it('returns a `PrerenderResource` from `SafeHtml` data', () => {
            const res = PrerenderResource.of(
                '/foo/bar.html', safe`<div></div>`);

            expect(res.path).toBe('/foo/bar.html');
            expect(new TextDecoder().decode(res.contents)).toBe('<div></div>');
        });

        it('throws when given non-`SafeHtml` input', () => {
            expect(() => PrerenderResource.of(
                '/foo/bar.html',
                'unsafe HTML content' as unknown as SafeHtml,
            )).toThrowError(/Only `SafeHtml` objects can be used in `\*.html` or `\*.htm` files\./);

            expect(() => PrerenderResource.of(
                '/foo/bar.html',
                { getHtmlAsString: () => 'unsafe HTML content' } as SafeHtml,
            )).toThrowError(/Only `SafeHtml` objects can be used in `\*.html` or `\*.htm` files\./);
        });

        it('throws when given an invalid URL path', () => {
            expect(() => PrerenderResource.of(
                'does/not/start/with/a/slash.ext',
                safe`Hello, World!`,
            )).toThrowError(/must start with a "\/"/);
        });
    });

    describe('fromText()', () => {
        it('returns a `PrerenderResource` from string data', () => {
            const res = PrerenderResource.fromText(
                '/foo/bar.txt', 'Hello World!');

            expect(res.path).toBe('/foo/bar.txt');
            expect(new TextDecoder().decode(res.contents)).toBe('Hello World!');
        });

        it('returns a `PrerenderResource` with input string re-encoded as UTF-8', () => {
            // The `¢` character is `\xc2\x00\xa2\x00` in UTF-16, which is used
            // for in-memory strings in JS. We expect this to be converted to
            // `\xc2\xa2` (the UTF-8 equivalent), when stored in the `Buffer`.
            const res = PrerenderResource.fromText('/foo/bar.txt', '¢');

            const contents = new Uint8Array(res.contents);
            expect(contents.length).toBe(2);
            expect(contents[0]).toBe(0xc2);
            expect(contents[1]).toBe(0xa2);
        });

        it('throws when given an invalid URL path', () => {
            expect(() => PrerenderResource.fromText(
                'does/not/start/with/a/slash.ext',
                'Hello, World!',
            )).toThrowError(/must start with a "\/"/);
        });

        it('throws when given an HTML path', () => {
            expect(() => PrerenderResource.fromText(
                '/index.html', 'Hello, World!',
            )).toThrowError(/this would be unsafe/);

            expect(() => PrerenderResource.fromText(
                '/index.htm', 'Hello, World!',
            )).toThrowError(/this would be unsafe/);
        });
    });

    describe('fromBinary()', () => {
        it('returns a `PrerenderResource` from a `TypedArray`', () => {
            const res = PrerenderResource.fromBinary(
                '/foo/bar.bin', new Uint8Array([ 0, 1, 2, 3 ]));
            
            expect(res.path).toBe('/foo/bar.bin');

            const contents = new Uint8Array(res.contents);
            expect(contents.length).toBe(4);
            expect(contents[0]).toBe(0);
            expect(contents[1]).toBe(1);
            expect(contents[2]).toBe(2);
            expect(contents[3]).toBe(3);
        });

        it('returns a `PrerenderResource` from an `ArrayBuffer`', () => {
            const res = PrerenderResource.fromBinary(
                '/foo/bar.bin', new Uint8Array([ 0, 1, 2, 3 ]).buffer);
            
            expect(res.path).toBe('/foo/bar.bin');

            const contents = new Uint8Array(res.contents);
            expect(contents.length).toBe(4);
            expect(contents[0]).toBe(0);
            expect(contents[1]).toBe(1);
            expect(contents[2]).toBe(2);
            expect(contents[3]).toBe(3);
        });

        it('throws an error when used with an HTML path', () => {
            expect(() => PrerenderResource.fromBinary(
                '/index.html', new Uint8Array([ 0, 1, 2, 3 ]),
            )).toThrowError(/this would be unsafe/);

            expect(() => PrerenderResource.fromBinary(
                '/index.htm', new Uint8Array([ 0, 1, 2, 3 ]),
            )).toThrowError(/this would be unsafe/);
        });
    });
});
