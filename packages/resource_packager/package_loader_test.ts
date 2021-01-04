import 'jasmine';

import { loadPackage } from 'rules_prerender/packages/resource_packager/package_loader';
import { useTempDir } from 'rules_prerender/common/testing/temp_dir';
import { promises as fs } from 'fs';

describe('package_loader', () => {
    describe('loadPackage()', () => {
        const tmpDir = useTempDir();

        it('loads the package at the given directory', async () => {
            await fs.writeFile(`${tmpDir.get()}/foo.txt`, '');
            await fs.mkdir(`${tmpDir.get()}/stuff`);
            await fs.writeFile(`${tmpDir.get()}/stuff/bar.txt`, '');
            await fs.mkdir(`${tmpDir.get()}/stuff/other`);
            await fs.writeFile(`${tmpDir.get()}/stuff/other/baz.txt`, '');

            const map = await loadPackage(tmpDir.get());

            expect(Array.from(map.entries())).toEqual(Object.entries({
                '/foo.txt': `${tmpDir.get()}/foo.txt`,
                '/stuff/bar.txt': `${tmpDir.get()}/stuff/bar.txt`,
                '/stuff/other/baz.txt': `${tmpDir.get()}/stuff/other/baz.txt`,
            }));
        });
    });
});
