import { useDevserver } from '../../common/testing/devserver.mjs';
import { useWebDriver, webDriverTestTimeout } from '../../common/testing/webdriver.mjs';

describe('Script Isolation', () => {
    const devserver = useDevserver('examples/script_isolation/devserver.sh');
    const wd = useWebDriver(devserver);

    it('renders `/foo.html` page with only `foo.js`', async () => {
        const browser = wd.get();
        await browser.url('/foo.html');

        expect(await browser.getTitle()).toBe('Script Isolation');
        expect(await browser.$('#replace-foo').getText())
            .toBe('This text rendered by page JavaScript!');

        // Not replaced, because `bar.js` isn't included.
        expect(await browser.$('#replace-bar').getText())
            .toBe('Text to be replaced.');
    }, webDriverTestTimeout);

    it('renders `/bar.html` page with only `bar.js`', async () => {
        const browser = wd.get();
        await browser.url('/bar.html');

        expect(await browser.getTitle()).toBe('Script Isolation');

        // Not replaced, because `bar.js` isn't included.
        expect(await browser.$('#replace-foo').getText())
            .toBe('Text to be replaced.');

        expect(await browser.$('#replace-bar').getText())
            .toBe('This text rendered by page JavaScript!');
    }, webDriverTestTimeout);
});
