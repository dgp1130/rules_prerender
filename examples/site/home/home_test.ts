import 'jasmine';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { resolveRunfile } from 'rules_prerender/common/runfiles';
import { useBrowser, usePage } from 'rules_prerender/common/testing/puppeteer';

const devserverBinary = resolveRunfile(
    'rules_prerender/examples/site/home/home_devserver');

describe('home', () => {
    const devserver = useDevserver(devserverBinary);
    const browser = useBrowser();
    const page = usePage(browser);

    it('renders the home page', async () => {
        await page.get().goto(
            `http://${devserver.get().host}:${devserver.get().port}`);
        
        await expectAsync(page.get().title()).toBeResolvedTo('Home');
    });
});
