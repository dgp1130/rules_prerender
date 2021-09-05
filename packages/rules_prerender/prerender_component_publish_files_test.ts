import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import { promises as fs } from 'fs';

const root = runfiles.resolvePackageRelative(
    'prerender_component_publish_files_testdata');

describe('prerender_component_publish_files()', () => {
    it('includes exactly the expected files', async () => {
        // Should include **exactly** these files and no more.
        const expectedFiles = [
            'component.js',
            'component.d.ts',
            'prerender_dep.js',
            'prerender_dep.d.ts',
            'script.mjs',
            'script.d.ts',
            'scripts.externs.js',
            'script_dep.mjs',
            'script_dep.d.ts',
            'script_dep.externs.js',
            'style.css',
            'component_resources', // from `resources` attribute.
        ];

        const actualFiles = await fs.readdir(root);

        expect(actualFiles.sort()).toEqual(expectedFiles.sort());

        // Separately test for the resources directory.
        const expectedResources = [ 'resource.txt' ];
        const actualResources = await fs.readdir(`${root}/component_resources`);
        expect(actualResources.sort()).toEqual(expectedResources.sort());
    });
});