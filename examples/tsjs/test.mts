import { useDevserver } from '../../common/testing/devserver.mjs';
import { useWebDriver, webDriverTestTimeout } from '../../common/testing/webdriver.mjs';

describe('TS/JS', () => {
    const devserver = useDevserver('examples/tsjs/devserver.sh');
    const wd = useWebDriver(devserver);

    it('renders TypeScript depending on JavaScript', async () => {
        const browser = wd.get();
        await browser.url('/ts-depends-on-js.html');

        expect(await browser.getTitle()).toBe('TS depends on JS');
        expect(await browser.$('.ts-parent > span').getText())
            .toBe('TS parent');
        expect(await browser.$('.js-child').getText()).toBe('JS child');
    }, webDriverTestTimeout);

    it('renders JavaScript depending on TypeScript', async () => {
        const browser = wd.get();
        await browser.url('/js-depends-on-ts.html');

        expect(await browser.getTitle()).toBe('JS depends on TS');
        expect(await browser.$('.js-parent > span').getText())
            .toBe('JS parent');
        expect(await browser.$('.ts-child').getText()).toBe('TS child');
    }, webDriverTestTimeout);

    it('renders client-side TypeScript depending on JavaScript', async () => {
        const browser = wd.get();
        await browser.url('/ts-script-depends-on-js-script.html');

        expect(await browser.getTitle()).toBe('TS script depends on JS script');
        expect(await browser.$('#replace-ts-parent-script').getText())
            .toBe('Hello, World!');
    }, webDriverTestTimeout);

    it('renders client-side JavaScript depending on TypeScript', async () => {
        const browser = wd.get();
        await browser.url('/js-script-depends-on-ts-script.html');

        expect(await browser.getTitle()).toBe('JS script depends on TS script');
        expect(await browser.$('#replace-js-parent-script').getText())
            .toBe('Hello, World!');
    }, webDriverTestTimeout);
});
