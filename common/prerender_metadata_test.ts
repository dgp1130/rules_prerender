import 'jasmine';

import { PrerenderMetadata, ScriptMetadata } from 'rules_prerender/common/prerender_metadata';

describe('prerender_metadata', () => {
    describe('PrerenderMetadata', () => {
        it('requires scripts', () => {
            // @ts-expect-error
            const metadata: PrerenderMetadata = {
                // No scripts.
            };

            expect().nothing();
        });
    });

    describe('ScriptMetadata', () => {
        it('requires a path', () => {
            // @ts-expect-error
            const metadata: ScriptMetadata = {
                // No path.
            };

            expect().nothing();
        });
    });
});
