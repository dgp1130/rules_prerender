import { promises as fs } from 'fs';

const root = 'packages/rules_prerender/prerender_component_publish_files_testdata';

describe('prerender_component_publish_files()', () => {
    it('includes exactly the expected files', async () => {
        // Should include **exactly** these files and no more.
        const expectedFiles = new Set([
            'component.mjs',
            'component.mjs.map',
            'component.d.mts',
            'prerender_dep.mjs',
            'prerender_dep.mjs.map',
            'prerender_dep.d.mts',
            'script.mjs',
            'script.mjs.map',
            'script.d.mts',
            'script_dep.mjs',
            'script_dep.mjs.map',
            'script_dep.d.mts',
            // Temporary bad assertion. Need to update component publishing to copy
            // styles into the correct position in the NPM package.
            'component_styles_reexport_binary_0',
            'resources', // from `resources` attribute.
        ]);

        const actualFiles = new Set(await fs.readdir(root));

        expect(actualFiles).toEqual(expectedFiles);

        // Separately test for the resources directory.
        const expectedResources = new Set([ 'resource.txt' ]);
        const actualResources = new Set(await fs.readdir(`${root}/resources`));
        expect(actualResources).toEqual(expectedResources);
    });
});
