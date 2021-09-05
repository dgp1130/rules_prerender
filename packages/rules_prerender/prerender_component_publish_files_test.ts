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
            'script.mjs',
            'script.d.ts',
            'scripts.externs.js',
        ];

        const actualFiles = await fs.readdir(root);

        expect(actualFiles.sort()).toEqual(expectedFiles.sort());
    });
});
