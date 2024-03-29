import { useDevserver } from '../../common/testing/devserver.mjs';
import { getColor, useWebDriver, webDriverTestTimeout } from '../../common/testing/webdriver.mjs';

describe('Declarative Shadow DOM', () => {
    const devserver = useDevserver('examples/declarative_shadow_dom/devserver.sh');
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

        const shadowContentColor =
            await getColor(browser, browser.$('#component').shadow$('div'));
        expect(shadowContentColor).toBe('rgb(255, 0, 0)'); // Red.

        const lightContentColor =
            await getColor(browser, browser.$('#component div'));
        expect(lightContentColor).toBe('rgb(0, 0, 0)'); // Black (default).
    }, webDriverTestTimeout);
});
