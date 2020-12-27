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
    });
});
