import { mockPrerenderMetadata } from '../../../common/models/prerender_metadata_mock';
import { generateEntryPoint } from './generator';

describe('generator', () => {
    describe('generateEntryPoint()', () => {
        it('generates an entry point', () => {
            const entryPoint = generateEntryPoint(mockPrerenderMetadata({
                scripts: [
                    { path: 'foo/bar/baz' },
                    { path: 'hello/world' },
                ],
            }), 2 /* importDepth */);
    
            expect(entryPoint).toBe(`
import '../../foo/bar/baz';
import '../../hello/world';
            `.trim());
        });

        it('generates an empty entry point when given no scripts', () => {
            const entryPoint = generateEntryPoint(mockPrerenderMetadata({
                scripts: [ /* no scripts */ ],
            }), 2 /* importDepth */);

            expect(entryPoint).toBe('');
        });

        it('generates a relative empty entry point with depth 0', () => {
            const entryPoint = generateEntryPoint(mockPrerenderMetadata({
                scripts: [
                    { path: 'foo/bar/baz' },
                    { path: 'hello/world' },
                ],
            }), 0 /* importDepth */);

            expect(entryPoint).toBe(`
import './foo/bar/baz';
import './hello/world';
            `.trim());
        });
    });
});
