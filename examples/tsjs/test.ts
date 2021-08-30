import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { useBrowser, usePage, puppeteerTestTimeout } from 'rules_prerender/common/testing/puppeteer';

const devserverBinary = runfiles.resolvePackageRelative('devserver');

describe('TS/JS', () => {
    const server = useDevserver(devserverBinary);
    const browser = useBrowser();
    const page = usePage(browser);

    it('renders TypeScript depending on JavaScript', async () => {
        await page.get().goto(
            `http://${server.get().host}:${server.get().port}/ts-depends-on-js.html`,
            { waitUntil: 'load' },
        );

        const title = await page.get().title();
        expect(title).toBe('TS depends on JS');

        const tsParent = await page.get().$eval(
            '.ts-parent > span', (el) => el.textContent);
        expect(tsParent).toBe('TS parent');

        const jsChild = await page.get().$eval(
            '.js-child', (el) => el.textContent?.trim());
        expect(jsChild).toBe('JS child');
    }, puppeteerTestTimeout);

    it('renders JavaScript depending on TypeScript', async () => {
        await page.get().goto(
            `http://${server.get().host}:${server.get().port}/js-depends-on-ts.html`,
            { waitUntil: 'load' },
        );

        const title = await page.get().title();
        expect(title).toBe('JS depends on TS');

        const jsParent = await page.get().$eval(
            '.js-parent > span', (el) => el.textContent);
        expect(jsParent).toBe('JS parent');

        const tsChild = await page.get().$eval(
            '.ts-child', (el) => el.textContent?.trim());
        expect(tsChild).toBe('TS child');
    }, puppeteerTestTimeout);

    it('renders client-side TypeScript depending on JavaScript', async () => {
        await page.get().goto(
            `http://${server.get().host}:${server.get().port}/ts-script-depends-on-js-script.html`,
            { waitUntil: 'load' },
        );

        const title = await page.get().title();
        expect(title).toBe('TS script depends on JS script');

        const replaced = await page.get().$eval(
            '#replace-ts-parent-script', (el) => el.textContent);
        expect(replaced).toBe('Hello, World!');
    }, puppeteerTestTimeout);

    it('renders client-side JavaScript depending on TypeScript', async () => {
        await page.get().goto(
            `http://${server.get().host}:${server.get().port}/js-script-depends-on-ts-script.html`,
            { waitUntil: 'load' },
        );

        const title = await page.get().title();
        expect(title).toBe('JS script depends on TS script');

        const replaced = await page.get().$eval(
            '#replace-js-parent-script', (el) => el.textContent);
        expect(replaced).toBe('Hello, World!');
    }, puppeteerTestTimeout);
});
