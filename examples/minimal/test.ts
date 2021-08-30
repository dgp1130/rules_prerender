import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { puppeteerTestTimeout, useBrowser, usePage } from 'rules_prerender/common/testing/puppeteer';

const devserverBinary = runfiles.resolvePackageRelative('devserver');

describe('minimal', () => {
    const server = useDevserver(devserverBinary);
    const browser = useBrowser();
    const page = usePage(browser);

    it('renders', async () => {
        await page.get().goto(
            `http://${server.get().host}:${server.get().port}/`,
            {
                waitUntil: 'load',
            },
        );

        const title = await page.get().title();
        expect(title).toBe('Minimal');

        const hello = await page.get().$eval('#hello', (el) => el.textContent);
        expect(hello).toBe('Hello, World!');

        const foo = await page.get().$eval('#foo', (el) => el.textContent);
        expect(foo).toBe('foo');

        const bar = await page.get().$eval('#bar', (el) => el.textContent);
        expect(bar).toBe('bar');
    }, puppeteerTestTimeout);
});
