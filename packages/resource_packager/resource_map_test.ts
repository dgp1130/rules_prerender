import 'jasmine';

import { ResourceMap } from 'rules_prerender/packages/resource_packager/resource_map';
import { mockFileRef } from 'rules_prerender/packages/resource_packager/resource_map_mock';

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
});
