import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { puppeteerTestTimeout, useBrowser, usePage } from 'rules_prerender/common/testing/puppeteer';

const devserverBinary = runfiles.resolvePackageRelative('devserver');

describe('Scripts', () => {
    const server = useDevserver(devserverBinary);
    const browser = useBrowser();
    const page = usePage(browser);

    it('renders with scripts', async () => {
        await page.get().goto(
            `http://${server.get().host}:${server.get().port}/`,
            {
                waitUntil: 'load',
            },
        );

        const title = await page.get().title();
        expect(title).toBe('Scripts');

        const replaced = await page.get().$eval(
            '#replace', (el) => el.textContent);
        expect(replaced).toBe('This text rendered by page JavaScript!');

        const componentReplaced = await page.get().$eval(
            '#component-replace', (el) => el.textContent);
        expect(componentReplaced)
            .toBe('This text rendered by component JavaScript!');

        const transitiveReplaced = await page.get().$eval(
            '#transitive-replace', (el) => el.textContent);
        expect(transitiveReplaced)
            .toBe('This text rendered by transitive JavaScript!');

        const pageContent = await page.get().evaluate(
            () => document.body.innerHTML);
        expect(pageContent).not.toContain(
            'bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE');
    }, puppeteerTestTimeout);
});
