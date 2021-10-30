import 'jasmine';
import 'webdriverio'; // For global `WebdriverIO` namespace.

import { runfiles } from '@bazel/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { useWebDriver, webDriverTestTimeout } from 'rules_prerender/common/testing/webdriver';

const devserverBinary = runfiles.resolvePackageRelative('devserver');

describe('Declarative Shadow DOM', () => {
    const devserver = useDevserver(devserverBinary);
    const wd = useWebDriver(devserver);

    it('attaches the declarative shadow root to its host', async () => {
        const browser = wd.get();
        await browser.url('/');

        expect(await browser.getTitle()).toBe('Declarative Shadow DOM');

        const component = await browser.$('#component');
        expect(await component.shadow$('div').getText()).toBe('Shadow content');
    }, webDriverTestTimeout);

    it('scopes CSS to the shadow root', async () => {
        const browser = wd.get();
        await browser.url('/');

        const shadowContent = await browser.$('#component').shadow$('div');
        const shadowContentColor = await getColor(browser, shadowContent);
        expect(shadowContentColor).toBe('rgb(255, 0, 0)'); // Red.

        const lightContent = await browser.$('#component div');
        const lightContentColor = await getColor(browser, lightContent);
        expect(lightContentColor).toBe('rgb(0, 0, 0)'); // Black (default).
    }, webDriverTestTimeout);
});

async function getColor(
    browser: WebdriverIO.Browser,
    element: WebdriverIO.Element,
): Promise<string> {
    return await browser.execute(
        (el) => getComputedStyle(el).color,
        element as unknown as HTMLElement, // Gets converted a DOM node.
    );
}
