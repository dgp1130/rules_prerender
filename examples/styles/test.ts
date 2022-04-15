import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { getColor, useWebDriver, webDriverTestTimeout } from 'rules_prerender/common/testing/webdriver';

const devserverBinary = runfiles.resolvePackageRelative('devserver');

describe('styles', () => {
    const devserver = useDevserver(devserverBinary);
    const wd = useWebDriver(devserver);

    it('renders with CSS', async () => {
        const browser = wd.get();
        await browser.url('/');

        expect(await browser.getTitle()).toBe('Styling');

        expect(await browser.$('.page').shadow$('.label').getText())
            .toBe(`I'm a page with some CSS!`);
        expect(await getColor(browser, browser.$('.page').shadow$('.label')))
            .toBe('rgb(255, 0, 0)'); // Red.

        expect(await browser.$('.component > .label').getText())
            .toBe(`I'm a component with some CSS!`);
        expect(await getColor(browser, browser.$('.component > .label')))
            .toBe('rgb(0, 128, 0)'); // Green.

        expect(await browser.$('.transitive > .label').getText())
            .toBe(`I'm a transitive component with some CSS!`);
        expect(await getColor(browser, browser.$('.transitive > .label')))
            .toBe('rgb(0, 0, 255)'); // Blue.

        // Note: `getPageSource()` returns a stringified representation of the
        // current DOM, **not** the original page source from the server.
        expect(await browser.getPageSource()).not.toContain(
            'bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE');
    }, webDriverTestTimeout);
});
