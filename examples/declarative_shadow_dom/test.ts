import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { puppeteerTestTimeout, useBrowser, usePage } from 'rules_prerender/common/testing/puppeteer';

const devserverBinary = runfiles.resolvePackageRelative('devserver');

describe('Declarative Shadow DOM', () => {
    const server = useDevserver(devserverBinary);
    const browser = useBrowser();
    const page = usePage(browser);

    it('attaches the declarative shadow root to its host', async () => {
        await page.get().goto(
            `http://${server.get().host}:${server.get().port}/`,
            { waitUntil: 'load' },
        );

        const title = await page.get().title();
        expect(title).toBe('Declarative Shadow DOM');

        const shadowRoot = await page.get().evaluateHandle(
            'document.querySelector("#component").shadowRoot');
        expect(shadowRoot).toBeTruthy();
    });

    it('scopes CSS to the shadow root', async () => {
        await page.get().goto(
            `http://${server.get().host}:${server.get().port}/`,
            { waitUntil: 'load' },
        );

        const shadowRedDiv = await page.get().evaluateHandle(
            'document.querySelector("#component").shadowRoot.querySelector("div.red")');
        expect(await shadowRedDiv.evaluate((el) => el.textContent))
            .toBe('Red shadow content');
        const shadowRedDivColor =
                await shadowRedDiv.evaluate((el) => getComputedStyle(el).color);
        expect(shadowRedDivColor).toBe('rgb(255, 0, 0)'); // Red.

        const shadowBlueDiv = await page.get().evaluateHandle(
            'document.querySelector("#component").shadowRoot.querySelector("div.blue")');
        expect(await shadowBlueDiv.evaluate((el) => el.textContent))
            .toBe('Blue shadow content');
        const shadowBlueDivColor =
                await shadowBlueDiv.evaluate((el) => getComputedStyle(el).color);
        expect(shadowBlueDivColor).toBe('rgb(0, 0, 255)'); // Blue.

        const lightDivText = await page.get().$eval(
            '#component div', (el) => el.textContent);
        expect(lightDivText).toBe('Light content');
        const lightDivColor = await page.get().$eval(
            '#component div', (el) => getComputedStyle(el).color);
        expect(lightDivColor).toBe('rgb(0, 0, 0)'); // Black (default).
    }, puppeteerTestTimeout);
});
