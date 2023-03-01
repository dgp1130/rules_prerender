import { promises as fs } from 'fs';

const site = 'examples/shared_chunks/site';

describe('Shared Chunks', () => {
    it('generates `/hello.js` without inlining `shared.js`', async () => {
        const hello = await fs.readFile(`${site}/hello.js`, 'utf8');
        expect(hello).not.toContain('World');
    });

    it('generates `/goodbye.js` without inlining `shared.js`', async () => {
        const goodbye = await fs.readFile(`${site}/goodbye.js`, 'utf8');
        expect(goodbye).not.toContain('World');
    });

    it('generates a shared chunk containing `shared.js`', async () => {
        // Should generate exactly three JavaScript files: `hello.js`,
        // `goodbye.js`, and one other shared chunk with a generated name.
        const entries = await fs.readdir(site);
        const sharedChunks = entries
            .filter((entry) => entry.endsWith('.js'))
            .filter((entry) => entry !== 'hello.js' && entry !== 'goodbye.js');
        expect(sharedChunks.length).toBe(1);
        const [ shared ] = sharedChunks;

        const sharedJs = await fs.readFile(`${site}/${shared}`, 'utf8');
        expect(sharedJs).toContain('World');
    });
});
