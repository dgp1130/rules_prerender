import { mockScriptAnnotation, mockStyleAnnotation } from '../../../common/models/prerender_annotation_mock.mjs';
import { mockScriptMetadata } from '../../../common/models/prerender_metadata_mock.mjs';
import { metadataFromPrerenderAnnotations } from './metadata.mjs';

describe('metadata', () => {
    describe('metadataFromPrerenderAnnotations()', () => {
        it('includes script annotations into the result metadata object', () => {
            const metadata = metadataFromPrerenderAnnotations(new Set([
                mockScriptAnnotation({ path: 'foo.js' }),
                mockScriptAnnotation({ path: 'bar.js' }),
                mockScriptAnnotation({ path: 'baz.js' }),
            ]));

            expect(metadata).toEqual([
                mockScriptMetadata({ path: 'foo.js' }),
                mockScriptMetadata({ path: 'bar.js' }),
                mockScriptMetadata({ path: 'baz.js' }),
            ]);
        });

        it('throws an error when given style annotations', () => {
            const style = mockStyleAnnotation({ path: 'foo.css' });
            expect(() => metadataFromPrerenderAnnotations(new Set([ style ])))
                .toThrowError(/Tried to add styles/);
        });
    });
});
