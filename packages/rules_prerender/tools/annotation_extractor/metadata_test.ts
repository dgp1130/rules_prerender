import 'jasmine';

import { mockScriptAnnotation, mockStyleAnnotation } from 'rules_prerender/common/models/prerender_annotation_mock';
import { mockPrerenderMetadata, mockScriptMetadata, mockStyleMetadata } from 'rules_prerender/common/models/prerender_metadata_mock';
import { assembleMetadata } from 'rules_prerender/packages/rules_prerender/tools/annotation_extractor/metadata';

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
                styles: [],
            }));
        });

        it('includes style annotations into the result metadata object', () => {
            const metadata = assembleMetadata(new Set([
                mockStyleAnnotation({ path: 'foo.css' }),
                mockStyleAnnotation({ path: 'bar.css' }),
                mockStyleAnnotation({ path: 'baz.css' }),
            ]));

            expect(metadata).toEqual(mockPrerenderMetadata({
                scripts: [],
                styles: [
                    mockStyleMetadata({ path: 'foo.css' }),
                    mockStyleMetadata({ path: 'bar.css' }),
                    mockStyleMetadata({ path: 'baz.css' }),
                ],
            }));
        });
    });
});
