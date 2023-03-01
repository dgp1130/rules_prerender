import { useDevserver } from '../../common/testing/devserver.mjs';
import { useWebDriver, webDriverTestTimeout } from '../../common/testing/webdriver.mjs';

describe('minimal', () => {
    const devserver = useDevserver('examples/minimal/devserver.sh');
    const wd = useWebDriver(devserver);

    it('renders', async () => {
        const browser = wd.get();
        await browser.url('/');

        expect(await browser.getTitle()).toBe('Minimal');
        expect(await browser.$('#hello').getText()).toBe('Hello, World!');
        expect(await browser.$('#foo').getText()).toBe('foo');
        expect(await browser.$('#bar').getText()).toBe('bar');
    }, webDriverTestTimeout);
});
