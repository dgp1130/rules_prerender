import { env } from 'process';
import puppeteer, { Browser, Page } from 'puppeteer';
import { Effect, useForEach, useForAll } from 'rules_prerender/common/testing/effects';

/**
 * Default timeout value to use for Puppeteer tests. They can be quite resource
 * intensive, and even if the test on its own is not that long, when run in
 * parallel with other tests, resource exhaustion can slow things down
 * drastically. This should be passed in as the third parameter to `it()`
 * functions which use Puppeteer.
 */
export const puppeteerTestTimeout = 60 * 1000; // 60 seconds.

/**
 * An effect encapsulating a Puppeteer {@link Browser}. Manages creation/cleanup
 * of a {@link Browser} instance. The same instance is used for all tests
 * because a restart is very likely not to be required.
 * 
 * Note: The browser is launched in headless mode (no GUI) if the `$DISPLAY`
 * environment variable is not set. By default, the Bazel sandbox isolates tests
 * from environment variables from the host machine, so this is usually unset.
 * When debugging Puppeteer tests, it can sometimes be useful to see the browser
 * and inspect the page under test directly. Passing through the `$DISPLAY`
 * variable via `--test_env=DISPLAY` will run in non-headless mode (with GUI)
 * for easy debugging.
 * 
 * Make sure to use {@link puppeteerTestTimeout} for any test which uses the
 * browser.
 * 
 * @return A proxied {@link Browser} instance usable within the test suite.
 */
export function useBrowser(): Effect<Browser> {
    return useForAll(async () => {
        // Run headless if $DISPLAY is **not** set. If $DISPLAY is set, user
        // likely explicitly passed this and is trying to debug a test.
        const headless = !env['DISPLAY'];

        const browser = await puppeteer.launch({
            headless,
            // Needed for headless declarative shadow DOM.
            args: ['--enable-experimental-web-platform-features'],
            // Timeout a little bit before Jasmine will so we get a Chrome
            // timeout error rather than a Jasmine timeout error, which is a
            // little more specific about where the problem could be.
            timeout: jasmine.DEFAULT_TIMEOUT_INTERVAL - 20 /* ms */,
        });

        return [ browser, () => { browser.close(); } ];
    });
}

/**
 * An effect encapsulating a Puppeteer {@link Page}. Manages creation/cleanup of
 * a {@link Page} instance.
 * 
 * Make sure to use {@link puppeteerTestTimeout} for any test which uses the
 * page.
 * 
 * @param browser An {@link Effect} of a Puppeteer {@link Browser} instance to
 *     create the {@link Page} on.
 * @return A proxied {@link Page} instance usable within a test.
 */
export function usePage(browser: Effect<Browser>): Effect<Page> {
    return useForEach(async () => {
        const page = await browser.get().newPage();
        page.setDefaultNavigationTimeout(puppeteerTestTimeout);

        return [ page, async () => { await page.close(); } ];
    });
}
