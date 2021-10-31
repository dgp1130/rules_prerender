import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { useWebDriver, webDriverTestTimeout } from 'rules_prerender/common/testing/webdriver';

const devserverBinary = runfiles.resolvePackageRelative('home_devserver');

describe('home', () => {
    const devserver = useDevserver(devserverBinary);
    const wd = useWebDriver(devserver);

    it('renders the home page', async () => {
        const browser = wd.get();
        await browser.url('/');

        expect(await browser.getTitle()).toBe('Home');
    }, webDriverTestTimeout);
});
