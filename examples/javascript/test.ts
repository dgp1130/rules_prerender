import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { useBrowser, usePage, puppeteerTestTimeout } from 'rules_prerender/common/testing/puppeteer';

const devserverBinary = runfiles.resolvePackageRelative('devserver');

describe('JavaScript', () => {
    const server = useDevserver(devserverBinary);
    const browser = useBrowser();
    const page = usePage(browser);    

    it('renders component', async () => {
        await page.get().goto(
            `http://${server.get().host}:${server.get().port}`,
            { waitUntil: 'load' },
        );

        const title = await page.get().title();
        expect(title).toBe('JavaScript');

        const prerendered =
            await page.get().$eval('#component', (el) => el.textContent);
        expect(prerendered).toBe('Hello from a JS component!');

        const replaced = await page.get().$eval(
            '#component-replace', (el) => el.textContent);
        expect(replaced)
            .toBe('This text rendered by component JavaScript: "Hello, World!"');
    }, puppeteerTestTimeout);
});
