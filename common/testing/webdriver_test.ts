import * as webdriverio from 'webdriverio';
import { useDevserver } from './devserver';
import { EffectTester } from './effect_tester';
import { useWebDriver, webDriverTestTimeout } from './webdriver';

describe('webdriver', () => {
    describe('useWebDriver()', () => {
        const devserver = useDevserver('common/testing/webdriver_test_server.sh');

        it('manages a WebDriver session without a server under test', async () => {
            const remoteSpy = spyOn(webdriverio, 'remote').and.callThrough();

            const tester = EffectTester.of(() => useWebDriver());
            expect(remoteSpy).not.toHaveBeenCalled(); // Yet.

            // `.initialize()` starts a browser with the remote WebDriver server
            // instance.
            await tester.initialize();
            expect(remoteSpy).toHaveBeenCalledTimes(1);
            const options = remoteSpy.calls.first().args[0];
            expect(options).toEqual({
                // From non-deterministic WebDriver server environment variable.
                hostname: jasmine.any(String),
                port: jasmine.any(Number),
                path: jasmine.any(String),

                baseUrl: undefined, // No server under test to infer from.

                capabilities: {
                    browserName: 'chrome',
                },
            });

            // Verify connection to the devserver.
            const browser = tester.get();
            await browser.url(`${devserver.get().url}webdriver_test_page.html`);
            expect(await browser.getTitle()).toBe('WebDriver Test Page');

            // Nothing to clean up, but shouldn't fail.
            await expectAsync(tester.cleanup()).toBeResolved();
        }, webDriverTestTimeout);

        it('manages a WebDriver session with a server under test', async () => {
            const remoteSpy = spyOn(webdriverio, 'remote').and.callThrough();

            const tester = EffectTester.of(() => useWebDriver(devserver));
            expect(remoteSpy).not.toHaveBeenCalled(); // Yet.

            // `.initialize()` starts a browser with the remote WebDriver server
            // instance.
            await tester.initialize();
            expect(remoteSpy).toHaveBeenCalledTimes(1);
            const options = remoteSpy.calls.first().args[0];
            expect(options).toEqual({
                // From non-deterministic WebDriver server environment variable.
                hostname: jasmine.any(String),
                port: jasmine.any(Number),
                path: jasmine.any(String),

                baseUrl: devserver.get().url,

                capabilities: {
                    browserName: 'chrome',
                },
            });

            // Verify connection to the devserver.
            const browser = tester.get();
            await browser.url('/webdriver_test_page.html');
            expect(await browser.getTitle()).toBe('WebDriver Test Page');

            // Nothing to clean up, but shouldn't fail.
            await expectAsync(tester.cleanup()).toBeResolved();
        }, webDriverTestTimeout);
    });
});
