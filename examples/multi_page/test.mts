import { useDevserver } from '../../common/testing/devserver.mjs';
import { getColor, useWebDriver, webDriverTestTimeout } from '../../common/testing/webdriver.mjs';

describe('multi_page', () => {
    const devserver = useDevserver('examples/multi_page/devserver.sh');
    const wd = useWebDriver(devserver);

    describe('index page', () => {
        it('renders', async () => {
            const browser = wd.get();
            await browser.url('/');

            expect(await browser.$('h2').getText()).toBe('Multi-Page');
            expect(await getColor(browser, browser.$('h2')))
                .toBe('rgb(255, 0, 0)'); // Red.

            const iconLoaded = await browser.$('img[src="/logo.png"]')
                .getProperty('complete');
            expect(iconLoaded).toBeTrue();

            const links = await browser.$$('nav a')
                .map((el) => el.getAttribute('href'));
            expect(links).toEqual([
                '/foo.html',
                '/bar.html',
                '/hello/world.html',
            ]);

            expect(await browser.$('#replace').getText())
                .toBe('This text rendered by page JavaScript!');
        }, webDriverTestTimeout);
    });

    describe('foo page', () => {
        it('renders', async () => {
            const browser = wd.get();
            await browser.url('/foo.html');

            expect(await browser.$('h2').getText()).toBe('Foo');
            expect(await getColor(browser, browser.$('h2')))
                .toBe('rgb(255, 0, 0)'); // Red.
            expect(await browser.$('#replace').getText())
                .toBe('This text rendered by page JavaScript!');
        }, webDriverTestTimeout);
    });

    describe('bar page', () => {
        it('renders', async () => {
            const browser = wd.get();
            await browser.url('/bar.html');

            expect(await browser.$('h2').getText()).toBe('Bar');
            expect(await getColor(browser, browser.$('h2')))
                .toBe('rgb(255, 0, 0)'); // Red.
            expect(await browser.$('#replace').getText())
                .toBe('This text rendered by page JavaScript!');
        }, webDriverTestTimeout);
    });

    describe('hello world page', () => {
        it('renders', async () => {
            const browser = wd.get();
            await browser.url('/hello/world.html');

            expect(await browser.$('h2').getText()).toBe('Hello, World!');
            expect(await getColor(browser, browser.$('h2')))
                .toBe('rgb(255, 0, 0)'); // Red.
            expect(await browser.$('#replace').getText())
                .toBe('This text rendered by page JavaScript!');
        }, webDriverTestTimeout);
    });
});
