import 'jasmine';

import { mockScriptAnnotation, mockStyleAnnotation } from '../../common/models/prerender_annotation_mock';
import { mockPrerenderMetadata, mockScriptMetadata } from '../../common/models/prerender_metadata_mock';
import { assembleMetadata } from './metadata';

describe('metadata', () => {
    describe('assembleMetadata()', () => {
        it('includes script annotations into the result metadata object', () => {
            const metadata = assembleMetadata(new Set([
                mockScriptAnnotation({ path: 'foo.js' }),
                mockScriptAnnotation({ path: 'bar.js' }),
                mockScriptAnnotation({ path: 'baz.js' }),
            ]));

            expect(metadata).toEqual(mockPrerenderMetadata({
                scripts: [
                    mockScriptMetadata({ path: 'foo.js' }),
                    mockScriptMetadata({ path: 'bar.js' }),
                    mockScriptMetadata({ path: 'baz.js' }),
                ],
            }));
        });

        it('throws an error when given style annotations', () => {
            const style = mockStyleAnnotation({ path: 'foo.css' });
            expect(() => assembleMetadata(new Set([ style ])))
                .toThrowError(/Tried to add styles/);
        });
    });
});
