import 'jasmine';

import { assembleMetadata } from 'rules_prerender/packages/annotation_extractor/metadata';

describe('metadata', () => {
    describe('assembleMetadata()', () => {
        it('converts a list of annotations into a metadata object', () => {
            const metadata = assembleMetadata(new Set([
                { type: 'script', path: 'foo.js' },
                { type: 'script', path: 'bar.js' },
                { type: 'script', path: 'baz.js' },
            ]));

            expect(metadata).toEqual({
                scripts: [
                    { path: 'foo.js' },
                    { path: 'bar.js' },
                    { path: 'baz.js' },
                ],
            });
        });
    });
});
