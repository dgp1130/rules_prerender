import 'jasmine';

import { env } from 'process';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { useBrowser, usePage } from 'rules_prerender/common/testing/puppeteer';

const runfiles = env['RUNFILES'];
if (!runfiles) throw new Error('$RUNFILES not set.');
const devserverBinary =
        `${runfiles}/rules_prerender/examples/minimal/devserver`;

describe('page', () => {
    const server = useDevserver(devserverBinary);
    const browser = useBrowser();
    const page = usePage(browser);

    it('exists', async () => {
        await page.goto(`http://${server.host}:${server.port}/`, {
            waitUntil: 'load',
        });

        const title = await page.title();
        expect(title).toBe('Minimal');

        const hello = await page.$('#hello');
        expect(hello).not.toBeNull();
        const helloText: string = await hello!.evaluate((el) => el.textContent);
        expect(helloText).toBe('Hello, World!');

        const foo = await page.$('#foo');
        expect(foo).not.toBeNull();
        const fooText: string = await foo!.evaluate((el) => el.textContent);
        expect(fooText).toBe('foo');

        const bar = await page.$('#bar');
        expect(bar).not.toBeNull();
        const barText: string = await bar!.evaluate((el) => el.textContent);
        expect(barText).toBe('bar');
    });
});
