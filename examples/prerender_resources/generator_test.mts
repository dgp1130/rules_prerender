import { promises as fs } from 'fs';

const prerenderedDir = 'examples/prerender_resources/prerender';

describe('Prerender Resources', () => {
    it('prerenders `hello.txt`', async () => {
        const content = await fs.readFile(
            `${prerenderedDir}/hello.txt`, 'utf-8');

        expect(content).toBe('Hello, World!');
    });

    it('prerenders `goodbye.txt`', async () => {
        const content = await fs.readFile(
            `${prerenderedDir}/goodbye.txt`, 'utf-8');

        expect(content).toBe('Goodbye, World!');
    });

    it('prerenders `data.bin`', async () => {
        const content = await fs.readFile(`${prerenderedDir}/data.bin`);

        expect(new Uint8Array(content)).toEqual(new Uint8Array([ 0, 1, 2, 3 ]));
    });
});
