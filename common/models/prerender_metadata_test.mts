import { PrerenderMetadata, ScriptMetadata } from './prerender_metadata.mjs';

describe('prerender_metadata', () => {
    describe('PrerenderMetadata', () => {
        it('requires scripts', () => {
            // @ts-expect-error from missing `scripts`.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const metadata: PrerenderMetadata = {
                // No scripts.
            };

            expect().nothing();
        });
    });

    describe('ScriptMetadata', () => {
        it('requires a path', () => {
            // @ts-expect-error fro missing `path`.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const metadata: ScriptMetadata = {
                // No path.
            };

            expect().nothing();
        });
    });
});
