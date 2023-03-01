import { useDevserver } from '../../../common/testing/devserver.mjs';
import { useWebDriver, webDriverTestTimeout } from '../../../common/testing/webdriver.mjs';

describe('home', () => {
    const devserver = useDevserver('examples/site/home/home_devserver.sh');
    const wd = useWebDriver(devserver);

    it('renders the home page', async () => {
        const browser = wd.get();
        await browser.url('/');

        expect(await browser.getTitle()).toBe('Home');
    }, webDriverTestTimeout);
});
