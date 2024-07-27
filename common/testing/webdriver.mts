import { promises as fs } from 'fs';
import * as path from 'path';
import { remote, ChainablePromiseElement } from 'webdriverio';
import { env } from 'process';
import { Effect, useForAll } from './effects.mjs';
import { TestServer } from './test_server.mjs';

/**
 * Default timeout value to use for WebDriver tests. They can be quite resource
 * intensive. Even if the test on its own is not that long, when run in parallel
 * with other tests, resource exhaustion can slow things down drastically. This
 * should be passed in as the third parameter to `it()` functions which use
 * WebDriverIO.
 */
export const webDriverTestTimeout = 60_000; // 60 seconds.

/**
 * An effect which initialize WebDriverIO for the given server under test.
 * Handles initialization and cleanup of WebDriver, using the same session for
 * multiple tests.
 *
 * The server is used to set a base URL for the WebDriverIO browser. If none is
 * given, then a base URL is not set.
 *
 * Example usage:
 *
 * ```typescript
 * describe('test suite', () => {
 *     // Handles initialization and cleanup automatically.
 *     const server = useDevserver('path/to/devserver/binary.sh');
 *     const wd = useWebDriver(server);
 *
 *     it('is alive', async () => {
 *         const browser = wd.get();
 *         await browser.url('/');
 *
 *         expect(await browser.getTitle()).toBe('Hello, World!');
 *     });
 * });
 * ```
 */
export function useWebDriver(serverUnderTest?: Effect<TestServer>):
        Effect<WebdriverIO.Browser> {
    return useForAll(async () => {
        const baseUrl = !serverUnderTest
            ? undefined
            : `http://${serverUnderTest.get().host}:${
                serverUnderTest.get().port}${serverUnderTest.get().basePath}`;
        const browser = await createSession(baseUrl);

        return [ browser, undefined /* afterAll() */ ] as const;
    });
}

interface WebDriverServer {
    hostname: string;
    port: number;
    path: string;
}

function getWebDriverServer(): WebDriverServer {
    // Get WebDriver server URL from environment variable provided by
    // `web_test()` and `web_test_suite()` rules.
    const wdServerUrl = env['WEB_TEST_WEBDRIVER_SERVER'];
    if (!wdServerUrl) {
        throw new Error('No WebDriver URL in environment. Is this test being'
            + ' run from a `web_test()` or `web_test_suite()` target?');
    }

    // Parse the URL into its parts.
    const [ authority, ...pathParts ] =
        wdServerUrl.slice('http://'.length).split('/');
    if (!authority) {
        throw new Error(`Failed to parse WebDriver server URL: ${wdServerUrl}`);
    }
    const [ hostname, portStr ] = authority.split(':');
    if (!hostname || !portStr) {
        throw new Error(`Failed to parse WebDriver server URL: ${wdServerUrl}`);
    }
    const port = parseInt(portStr);
    const path = `/${pathParts.join('/')}`;

    return { hostname, port, path };
}

/**
 * Defines the type of the browser metadata JSON file. This is an incomplete
 * type, it has most of the properties of the JSON config file used to set up
 * the browser.
 */
interface BrowserMetadata {
    capabilities: {
        browserName: string;
        // Other properties...
    };
}

/** Returns the name of the browser used in this test binary. */
async function getBrowserName(): Promise<string> {
    const runfiles = env['RUNFILES'];
    if (!runfiles) {
        throw new Error('Cannot find runfiles.');
    }

    // `WEB_TEST_METADATA` contains a link to a modified form of the `*.json`
    // config file used to set up the browser.
    const metadataFile = env['WEB_TEST_METADATA'];
    if (!metadataFile) {
        throw new Error('No browser metadata file in environment. Is this test'
            + ' being run from a `web_test()` or `web_test_suite()` target?');
    }

    // Read metadata from file.
    const metadataContent =
        await fs.readFile(path.join(runfiles, metadataFile), 'utf-8');
    const metadata = JSON.parse(metadataContent) as BrowserMetadata;

    // Extract browser name from the metadata.
    return metadata.capabilities.browserName;
}

async function createSession(baseUrl?: string): Promise<WebdriverIO.Browser> {
    const { hostname, port, path } = getWebDriverServer();
    const browserName = await getBrowserName();

    return await remote({
        hostname,
        port,
        path,
        baseUrl,
        capabilities: { browserName },

        // Whether or not we run headless is not defined here, but is actually
        // defined by the test browser being used at the Blaze layer.
    });
}

/**
 * Returns the color of the given element in rgb format like "rgb(255, 0, 0)".
 */
export async function getColor(
    browser: WebdriverIO.Browser,
    elementPromise: WebdriverIO.Element
        | ChainablePromiseElement<WebdriverIO.Element>
        | ChainablePromiseElement<Promise<WebdriverIO.Element>>,
): Promise<string> {
    return await browser.execute(
        (el) => getComputedStyle(el).color,
        // Gets converted a DOM when passed in as an argument.
        (await elementPromise) as unknown as HTMLElement,
    );
}
