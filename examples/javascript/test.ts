import 'jasmine';

import { env } from 'process';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { useBrowser, usePage } from 'rules_prerender/common/testing/puppeteer';

const runfiles = env['RUNFILES'];
if (!runfiles) throw new Error('$RUNFILES not set.');
const devserverBinary =
        `${runfiles}/rules_prerender/examples/javascript/devserver`;

describe('javascript', () => {
    const server = useDevserver(devserverBinary);
    const browser = useBrowser();
    const page = usePage(browser);

    it('renders with JavaScript', async () => {
        await page.goto(`http://${server.host}:${server.port}/`, {
            waitUntil: 'load',
        });

        const title = await page.title();
        expect(title).toBe('JavaScript');

        const replaced = await page.$eval('#replace', (el) => el.textContent);
        expect(replaced).toBe('This text rendered by page JavaScript!');

        const componentReplaced =
                await page.$eval('#component-replace', (el) => el.textContent);
        expect(componentReplaced)
                .toBe('This text rendered by component JavaScript!');

        const transitiveReplaced =
                await page.$eval('#transitive-replace', (el) => el.textContent);
        expect(transitiveReplaced)
                .toBe('This text rendered by transitive JavaScript!');

        const pageContent = await page.evaluate(() => document.body.innerHTML);
        expect(pageContent).not.toContain(
                'bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE');
    });
});
