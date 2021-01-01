import 'jasmine';

import { resolveRunfile } from 'rules_prerender/common/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { useBrowser, usePage } from 'rules_prerender/common/testing/puppeteer';

const devserverBinary = resolveRunfile(
        'rules_prerender/examples/styles/devserver');

describe('styles', () => {
    const server = useDevserver(devserverBinary);
    const browser = useBrowser();
    const page = usePage(browser);

    it('renders with CSS', async () => {
        await page.get().goto(
            `http://${server.get().host}:${server.get().port}/`,
            {
                waitUntil: 'load',
            },
        );

        const title = await page.get().title();
        expect(title).toBe('Styling');

        const pageLbl = await page.get().$eval(
                '.page > .label', (el) => el.textContent);
        expect(pageLbl).toBe('I\'m a page with some CSS!');
        const pageLblColor = await page.get().$eval(
                '.page > .label', (el) => getComputedStyle(el).color);
        expect(pageLblColor).toBe('rgb(255, 0, 0)'); // Red.

        const componentLbl = await page.get().$eval(
                '.component > .label', (el) => el.textContent);
        expect(componentLbl).toBe('I\'m a component with some CSS!');
        const componentLblColor = await page.get().$eval(
                '.component > .label', (el) => getComputedStyle(el).color);
        expect(componentLblColor).toBe('rgb(0, 128, 0)'); // Green.

        const transitiveLbl = await page.get().$eval(
                '.transitive > .label', (el) => el.textContent);
        expect(transitiveLbl)
                .toBe('I\'m a transitive component with some CSS!');
        const transitiveLblColor = await page.get().$eval(
                '.transitive > .label', (el) => getComputedStyle(el).color);
        expect(transitiveLblColor).toBe('rgb(0, 0, 255)'); // Blue.

        const pageContent = await page.get().evaluate(
                () => document.body.innerHTML);
        expect(pageContent).not.toContain(
                'bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE');
    });
});
