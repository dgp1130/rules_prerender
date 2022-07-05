import 'jasmine';

import { ResourceMap } from './resource_map';
import { mockFileRef } from './resource_map_mock';

describe('ResourceMap', () => {
    describe('urlPaths()', () => {
        it('returns all the UrlPath objects in the map', () => {
            const map = ResourceMap.fromEntries(Object.entries({
                '/foo.html': mockFileRef(),
                '/bar.js': mockFileRef(),
                '/baz.css': mockFileRef(),
            }));

            expect(Array.from(map.urlPaths())).toEqual([
                '/foo.html',
                '/bar.js',
                '/baz.css',
            ]);
        });
    });

    describe('fileRefs()', () => {
        it('returns all the FileRef objects in the map', () => {
            const map = ResourceMap.fromEntries(Object.entries({
                '/foo.html': 'src/foo.html',
                '/bar.js': 'src/bar.js',
                '/baz.css': 'src/baz.css',
            }));

            expect(Array.from(map.fileRefs())).toEqual([
                'src/foo.html',
                'src/bar.js',
                'src/baz.css',
            ]);
        });
    });

    describe('entries()', () => {
        it('returns all the entries in the map', () => {
            const map = ResourceMap.fromEntries(Object.entries({
                '/foo.html': 'src/foo.html',
                '/bar.js': 'src/bar.js',
                '/baz.css': 'src/baz.css',
            }));
    
            expect(Array.from(map.entries())).toEqual(Object.entries({
                '/foo.html': 'src/foo.html',
                '/bar.js': 'src/bar.js',
                '/baz.css': 'src/baz.css',
            }));
        });
    });

    describe('fromEntries()', () => {
        it('throws when a URL path is not absolute', () => {
            expect(() => ResourceMap.fromEntries(Object.entries({
                '/foo.html': mockFileRef(),
                'bar.js': mockFileRef(), // ERROR: No leading slash!
            }))).toThrowError(/URL paths must be absolute/);
        }); 
    });

    describe('reRoot()', () => {
        it('re-roots the given `ResourceMap`', () => {
            const input = ResourceMap.fromEntries(Object.entries({
                '/foo.html': 'src/foo.html',
                '/bar/baz.txt': 'src/stuff/baz.txt',
            }));

            const reRooted = ResourceMap.reRoot('/test', input);

            expect(Array.from(reRooted.entries())).toEqual(Object.entries({
                '/test/foo.html': 'src/foo.html',
                '/test/bar/baz.txt': 'src/stuff/baz.txt',
            }));
        });

        it('throws an error when given a root that does not start with a slash', () => {
            const input = ResourceMap.fromEntries(Object.entries({
                '/foo.html': 'src/foo.html',
            }));

            expect(() => ResourceMap.reRoot('test', input))
                .toThrowError(/URL paths must be absolute/);
        });

        it('throws an error when given a root that ends with a slash', () => {
            const input = ResourceMap.fromEntries(Object.entries({
                '/foo.html': 'src/foo.html',
            }));

            expect(() => ResourceMap.reRoot('/test/', input))
                .toThrowError('New root must not end with a slash: /test/');
        });
    });

    describe('merge()', () => {
        it('returns a merged `ResourceMap` from all the inputs', () => {
            const merged = ResourceMap.merge(
                ResourceMap.fromEntries(Object.entries({
                    '/foo.html': 'src/foo.html',
                })),
                ResourceMap.fromEntries(Object.entries({
                    '/stuff/bar.txt': 'src/somewhere/bar.txt',
                })),
                ResourceMap.fromEntries(Object.entries({
                    '/stuff/other/baz.txt': 'src/elsewhere/baz.txt',
                    '/hello/world.txt': 'src/test.ext',
                })),
            );

            expect(Array.from(merged.entries())).toEqual(Object.entries({
                '/foo.html': 'src/foo.html',
                '/stuff/bar.txt': 'src/somewhere/bar.txt',
                '/stuff/other/baz.txt': 'src/elsewhere/baz.txt',
                '/hello/world.txt': 'src/test.ext',
            }));
        });

        it('throws an error when given two `ResourceMap` objects with the same path', () => {
            expect(() => ResourceMap.merge(
                ResourceMap.fromEntries(Object.entries({
                    '/foo.html': mockFileRef(),
                    '/duplicate.txt': 'src/duplicate.txt',
                })),
                ResourceMap.fromEntries(Object.entries({
                    '/duplicate.txt': 'bazel-bin/stuff/duplicate.txt',
                })),
            )).toThrowError(`
Found URL path conflict. \`/duplicate.txt\` maps to both:
  src/duplicate.txt
**and**
  bazel-bin/stuff/duplicate.txt
            `.trim());
        });
    });
});
