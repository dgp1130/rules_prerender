import { useDevserver } from './devserver.mjs';
import { EffectTester } from './effect_tester.mjs';
import { useWebDriver, webDriverTestTimeout } from './webdriver.mjs';

describe('webdriver', () => {
    describe('useWebDriver()', () => {
        const devserver = useDevserver('common/testing/webdriver_test_server.sh');

        it('manages a WebDriver session without a server under test', async () => {
            const tester = EffectTester.of(() => useWebDriver());

            // `.initialize()` starts a browser with the remote WebDriver server
            // instance.
            await tester.initialize();

            // Verify connection to the devserver.
            const browser = tester.get();
            await browser.url(`${devserver.get().url}webdriver_test_page.html`);
            expect(await browser.getTitle()).toBe('WebDriver Test Page');

            // Nothing to clean up, but shouldn't fail.
            await expectAsync(tester.cleanup()).toBeResolved();
        }, webDriverTestTimeout);

        it('manages a WebDriver session with a server under test', async () => {
            const tester = EffectTester.of(() => useWebDriver(devserver));

            // `.initialize()` starts a browser with the remote WebDriver server
            // instance.
            await tester.initialize();

            // Verify connection to the devserver.
            const browser = tester.get();
            await browser.url('/webdriver_test_page.html');
            expect(await browser.getTitle()).toBe('WebDriver Test Page');

            // Nothing to clean up, but shouldn't fail.
            await expectAsync(tester.cleanup()).toBeResolved();
        }, webDriverTestTimeout);
    });
});
