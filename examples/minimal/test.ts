import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { useWebDriver, webDriverTestTimeout } from 'rules_prerender/common/testing/webdriver';

const devserverBinary = runfiles.resolvePackageRelative('devserver');

describe('minimal', () => {
    const devserver = useDevserver(devserverBinary);
    const wd = useWebDriver(devserver);

    it('renders', async () => {
        const browser = wd.get();
        await browser.url('/');

        expect(await browser.getTitle()).toBe('Minimal');
        expect(await browser.$('#hello').getText()).toBe('Hello, World!');
        expect(await browser.$('#foo').getText()).toBe('foo');
        expect(await browser.$('#bar').getText()).toBe('bar');
    }, webDriverTestTimeout);
});
