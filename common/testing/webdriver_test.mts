import { useDevserver } from './devserver.mjs';
import { EffectTester } from './effect_tester.mjs';
import { hydrate, useWebDriver, webDriverTestTimeout } from './webdriver.mjs';

describe('webdriver', () => {
    const devserver = useDevserver('common/testing/webdriver_test_server.sh');

    describe('useWebDriver()', () => {
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

    describe('hydrate', () => {
        it('hydrates the given custom element', async () => {
            const tester = EffectTester.of(() => useWebDriver(devserver));

            await tester.initialize();

            const browser = tester.get();
            await browser.url('/webdriver_test_page.html');

            const deferred = await browser.$('deferred-element');
            await expectAsync(hydrate(browser, deferred)).toBeResolved();

            const deferHydration = await browser.execute(
                (el) => el.getAttribute('defer-hydration'),
                deferred as unknown as Element,
            );
            expect(deferHydration).toBeNull();

            await expectAsync(tester.cleanup()).toBeResolved();
        });
    });
});
