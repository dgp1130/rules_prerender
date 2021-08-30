import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { puppeteerTestTimeout, useBrowser, usePage } from 'rules_prerender/common/testing/puppeteer';

const devserverBinary = runfiles.resolvePackageRelative('home_devserver');

describe('home', () => {
    const devserver = useDevserver(devserverBinary);
    const browser = useBrowser();
    const page = usePage(browser);

    it('renders the home page', async () => {
        await page.get().goto(
            `http://${devserver.get().host}:${devserver.get().port}`);
        
        await expectAsync(page.get().title()).toBeResolvedTo('Home');
    }, puppeteerTestTimeout);
});
