import { useDevserver } from '../../common/testing/devserver.mjs';
import { useWebDriver, webDriverTestTimeout } from '../../common/testing/webdriver.mjs';

describe('Scripts', () => {
    const devserver = useDevserver('examples/scripts/devserver.sh');
    const wd = useWebDriver(devserver);

    it('renders with scripts', async () => {
        const browser = wd.get();
        await browser.url('/');

        expect(await browser.getTitle()).toBe('Scripts');
        expect(await browser.$('#replace').getText())
            .toBe('This text rendered by page JavaScript!');
        expect(await browser.$('#component-replace').getText())
            .toBe('This text rendered by component JavaScript!');
        expect(await browser.$('#transitive-replace').getText())
            .toBe('This text rendered by transitive JavaScript!');

        // Note: This is a stringified representation of the current DOM,
        // **not** the original source downloaded from the server.
        expect(await browser.getPageSource())
            .not.toContain('bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE');
    }, webDriverTestTimeout);
});
