import 'jasmine';

import { env } from 'process';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { useBrowser, usePage } from 'rules_prerender/common/testing/puppeteer';

const runfiles = env['RUNFILES'];
if (!runfiles) throw new Error('$RUNFILES not set.');
const devserverBinary =
        `${runfiles}/rules_prerender/examples/minimal/devserver`;

describe('minimal', () => {
    const server = useDevserver(devserverBinary);
    const browser = useBrowser();
    const page = usePage(browser);

    it('renders', async () => {
        await page.goto(`http://${server.host}:${server.port}/`, {
            waitUntil: 'load',
        });

        const title = await page.title();
        expect(title).toBe('Minimal');

        const hello = await page.$eval('#hello', (el) => el.textContent);
        expect(hello).toBe('Hello, World!');

        const foo = await page.$eval('#foo', (el) => el.textContent);
        expect(foo).toBe('foo');

        const bar = await page.$eval('#bar', (el) => el.textContent);
        expect(bar).toBe('bar');
    });
});
