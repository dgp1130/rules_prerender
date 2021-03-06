import 'jasmine';

import { mockPrerenderMetadata, mockStyleMetadata } from 'rules_prerender/common/models/prerender_metadata_mock';
import { generateEntryPoint } from 'rules_prerender/packages/style_entry_generator/generator';

describe('generator', () => {
    describe('generateEntryPoint()', () => {
        it('generates an entry point', () => {
            const entryPoint = generateEntryPoint(mockPrerenderMetadata({
                styles: [
                    mockStyleMetadata({ path: 'wksp/foo/bar/baz.css' }),
                    mockStyleMetadata({ path: 'wksp/hello/world.css' }),
                ],
            }));
    
            expect(entryPoint).toBe(`
@import 'wksp/foo/bar/baz.css';
@import 'wksp/hello/world.css';
            `.trim());
        });

        it('generates an empty entry point when given no styles', () => {
            const entryPoint = generateEntryPoint(mockPrerenderMetadata({
                styles: [ /* no styles */ ],
            }));

            expect(entryPoint).toBe('');
        });
    });
});
