import 'jasmine';

import { resolveRunfile } from 'rules_prerender/common/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { useBrowser, usePage } from 'rules_prerender/common/testing/puppeteer';

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

            const title = await page.get().title();
            expect(title).toBe('Multi-Page');

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
        });
    });

    describe('foo page', () => {
        it('renders', async () => {
            await page.get().goto(
                `http://${server.get().host}:${server.get().port}/foo.html`,
                { waitUntil: 'load' },
            );

            expect(await page.get().content()).toContain('foo');
        });
    });

    describe('bar page', () => {
        it('renders', async () => {
            await page.get().goto(
                `http://${server.get().host}:${server.get().port}/bar.html`,
                { waitUntil: 'load' },
            );

            expect(await page.get().content()).toContain('bar');
        });
    });

    describe('hello world page', () => {
        it('renders', async () => {
            await page.get().goto(
                `http://${server.get().host}:${server.get().port}/hello/world.html`,
                { waitUntil: 'load' },
            );

            expect(await page.get().content()).toContain('Hello, World!');
        });
    });
});
