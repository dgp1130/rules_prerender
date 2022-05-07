import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import { promises as fs } from 'fs';

const root = runfiles.resolvePackageRelative(
    'prerender_component_publish_files_testdata');

describe('prerender_component_publish_files()', () => {
    it('includes exactly the expected files', async () => {
        // Should include **exactly** these files and no more.
        const expectedFiles = new Set([
            'component.js',
            'component.d.ts',
            'prerender_dep.js',
            'prerender_dep.js.map',
            'prerender_dep.d.ts',
            'script.js',
            'script.js.map',
            'script.d.ts',
            'script_dep.js',
            'script_dep.js.map',
            'script_dep.d.ts',
            'style.css',
            'style.css.map',
            'component_resources', // from `resources` attribute.
        ]);

        const actualFiles = new Set(await fs.readdir(root));

        expect(actualFiles).toEqual(expectedFiles);

        // Separately test for the resources directory.
        const expectedResources = new Set([ 'resource.txt' ]);
        const actualResources = new Set(await fs.readdir(`${root}/component_resources`));
        expect(actualResources).toEqual(expectedResources);
    });
});
