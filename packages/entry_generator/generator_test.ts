import 'jasmine';

import { generateEntryPoint } from 'rules_prerender/packages/entry_generator/generator';

describe('generator', () => {
    describe('generateEntryPoint()', () => {
        it('generates an entry point', () => {
            const entryPoint = generateEntryPoint({
                scripts: [
                    { path: 'wksp/foo/bar/baz' },
                    { path: 'wksp/hello/world' },
                ],
            });
    
            expect(entryPoint).toBe(`
import 'wksp/foo/bar/baz';
import 'wksp/hello/world';
            `.trim());
        });

        it('generates an empty entry point when given no scripts', () => {
            const entryPoint = generateEntryPoint({
                scripts: [ /* no scripts */ ],
            });

            expect(entryPoint).toBe('');
        });
    });
});
