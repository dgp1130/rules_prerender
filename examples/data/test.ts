import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { puppeteerTestTimeout, useBrowser, usePage } from 'rules_prerender/common/testing/puppeteer';

const devserverBinary = runfiles.resolvePackageRelative('devserver');

describe('data', () => {
    const server = useDevserver(devserverBinary);
    const browser = useBrowser();
    const page = usePage(browser);

    describe('index page', () => {
        it('renders', async () => {
            await page.get().goto(
                `http://${server.get().host}:${server.get().port}/`,
                { waitUntil: 'load' },
            );

            const title = await page.get().title();
            expect(title).toBe('Data');

            const header = await page.get().$eval('h2', (el) => el.textContent);
            expect(header).toBe('Data');

            const links = await page.get().$$eval(
                'li > a', (els) => els.map((el) => el.getAttribute('href')));
            expect(links).toEqual(jasmine.arrayWithExactContents([
                '/posts/foo.html',
                '/posts/bar.html',
                '/posts/baz.html',
            ]));
        }, puppeteerTestTimeout);
    });

    describe('foo page', () => {
        it('renders', async () => {
            await page.get().goto(
                `http://${server.get().host}:${server.get().port}/posts/foo.html`,
                { waitUntil: 'load' },
            );

            const title = await page.get().title();
            expect(title).toBe('foo');

            const header = await page.get().$eval('h2', (el) => el.textContent);
            expect(header).toBe('foo');

            const content = await page.get().$eval(
                'article', (el) => el.textContent);
            expect(content).toBe('This is the text for the "foo" post!');
        }, puppeteerTestTimeout);
    });

    describe('bar page', () => {
        it('renders', async () => {
            await page.get().goto(
                `http://${server.get().host}:${server.get().port}/posts/bar.html`,
                { waitUntil: 'load' },
            );

            const title = await page.get().title();
            expect(title).toBe('bar');

            const header = await page.get().$eval('h2', (el) => el.textContent);
            expect(header).toBe('bar');

            const content = await page.get().$eval(
                'article', (el) => el.textContent);
            expect(content).toBe('This is the text for the "bar" post!');
        }, puppeteerTestTimeout);
    });

    describe('baz page', () => {
        it('renders', async () => {
            await page.get().goto(
                `http://${server.get().host}:${server.get().port}/posts/baz.html`,
                { waitUntil: 'load' },
            );

            const title = await page.get().title();
            expect(title).toBe('baz');

            const header = await page.get().$eval('h2', (el) => el.textContent);
            expect(header).toBe('baz');

            const content = await page.get().$eval(
                'article', (el) => el.textContent);
            expect(content).toBe('This is the text for the "baz" post!');
        }, puppeteerTestTimeout);
    });
});
