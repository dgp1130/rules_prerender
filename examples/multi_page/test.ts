import 'jasmine';

import { resolveRunfile } from 'rules_prerender/common/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { puppeteerTestTimeout, useBrowser, usePage } from 'rules_prerender/common/testing/puppeteer';

const devserverBinary = resolveRunfile(
    'rules_prerender/examples/multi_page/devserver');

describe('multi_page', () => {
    const server = useDevserver(devserverBinary);
    const browser = useBrowser();
    const page = usePage(browser);

    describe('index page', () => {
        it('renders', async () => {
            await page.get().goto(
                `http://${server.get().host}:${server.get().port}/`,
                { waitUntil: 'load' },
            );

            const headerLbl = await page.get()
                .$eval('h2', (el) => el.textContent);
            expect(headerLbl).toBe('Multi-Page');

            const headerColor = await page.get()
                .$eval('h2', (el) => getComputedStyle(el).color);
            expect(headerColor).toBe('rgb(255, 0, 0)'); // Red.

            const iconLoaded = await page.get().$eval(
                'img[src="/logo.png"]',
                (img) => (img as HTMLImageElement).complete,
            );
            expect(iconLoaded).toBeTrue();

            const links = await page.get().$$eval(
                'nav a', (els) => els.map((el) => el.getAttribute('href')));
            expect(links).toEqual([
                '/foo.html',
                '/bar.html',
                '/hello/world.html',
            ]);

            const replaced = await page.get().$eval(
                    '#replace', (el) => el.textContent);
            expect(replaced).toBe('This text rendered by page JavaScript!');
        }, puppeteerTestTimeout);
    });

    describe('foo page', () => {
        it('renders', async () => {
            await page.get().goto(
                `http://${server.get().host}:${server.get().port}/foo.html`,
                { waitUntil: 'load' },
            );

            const headerLbl = await page.get()
                .$eval('h2', (el) => el.textContent);
            expect(headerLbl).toBe('Foo');

            const headerColor = await page.get()
                .$eval('h2', (el) => getComputedStyle(el).color);
            expect(headerColor).toBe('rgb(255, 0, 0)'); // Red.

            const replaced = await page.get().$eval(
                    '#replace', (el) => el.textContent);
            expect(replaced).toBe('This text rendered by page JavaScript!');
        }, puppeteerTestTimeout);
    });

    describe('bar page', () => {
        it('renders', async () => {
            await page.get().goto(
                `http://${server.get().host}:${server.get().port}/bar.html`,
                { waitUntil: 'load' },
            );

            const headerLbl = await page.get()
                .$eval('h2', (el) => el.textContent);
            expect(headerLbl).toBe('Bar');

            const headerColor = await page.get()
                .$eval('h2', (el) => getComputedStyle(el).color);
            expect(headerColor).toBe('rgb(255, 0, 0)'); // Red.

            const replaced = await page.get().$eval(
                    '#replace', (el) => el.textContent);
            expect(replaced).toBe('This text rendered by page JavaScript!');
        }, puppeteerTestTimeout);
    });

    describe('hello world page', () => {
        it('renders', async () => {
            await page.get().goto(
                `http://${server.get().host}:${server.get().port}/hello/world.html`,
                { waitUntil: 'load' },
            );

            const headerLbl = await page.get()
                .$eval('h2', (el) => el.textContent);
            expect(headerLbl).toBe('Hello, World!');

            const headerColor = await page.get()
                .$eval('h2', (el) => getComputedStyle(el).color);
            expect(headerColor).toBe('rgb(255, 0, 0)'); // Red.

            const replaced = await page.get().$eval(
                    '#replace', (el) => el.textContent);
            expect(replaced).toBe('This text rendered by page JavaScript!');
        }, puppeteerTestTimeout);
    });
});
