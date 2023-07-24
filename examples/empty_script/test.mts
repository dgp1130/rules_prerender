import { useDevserver } from '../../common/testing/devserver.mjs';
import { useWebDriver } from '../../common/testing/webdriver.mjs';

describe('empty_scripts', () => {
    const devserver = useDevserver('examples/empty_script/devserver.sh');
    const wd = useWebDriver(devserver);

    describe('index page', () => {
        it('renders without a script', async () => {
            const browser = wd.get();
            await browser.url('/');

            expect(await browser.$('h2').getText()).toBe('Empty script');

            // Expect only the live reload script.
            const scripts = await browser.$$('script');
            expect(scripts.length).toBe(1);
        });
    });
});
