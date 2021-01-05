import 'jasmine';

import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { useBrowser, usePage } from 'rules_prerender/common/testing/puppeteer';
import { resolveRunfile } from 'rules_prerender/common/runfiles';

const devserverBinary = resolveRunfile(
        'rules_prerender/examples/resources/devserver');

describe('resources', () => {
    const server = useDevserver(devserverBinary);
    const browser = useBrowser();
    const page = usePage(browser);

    it('renders with resources', async () => {
        await page.get().goto(
            `http://${server.get().host}:${server.get().port}`,
            { waitUntil: 'load' },
        );

        const title = await page.get().title();
        expect(title).toBe('Resources');

        const pageImageLoaded = await page.get().$eval(
            'img[src="/favicon.ico"]',
            (img) => (img as HTMLImageElement).complete,
        );
        expect(pageImageLoaded).toBeTrue();

        const componentImageLoaded = await page.get().$eval(
            'img[src="/images/component.png"]',
            (img) => (img as HTMLImageElement).complete,
        );
        expect(componentImageLoaded).toBeTrue();

        const transitiveImageLoaded = await page.get().$eval(
            'img[src="/images/transitive.png"]',
            (img) => (img as HTMLImageElement).complete,
        );
        expect(transitiveImageLoaded).toBeTrue();
    });
});
