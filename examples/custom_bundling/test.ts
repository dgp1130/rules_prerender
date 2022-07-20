import { useDevserver } from '../../common/testing/devserver';
import { useWebDriver, webDriverTestTimeout } from '../../common/testing/webdriver';

describe('custom bundling', () => {
    const devserver = useDevserver('examples/custom_bundling/devserver');
    const wd = useWebDriver(devserver);

    it('renders a custom bundled page', async () => {
        const browser = wd.get();
        await browser.url('/');

        expect(await browser.getTitle()).toBe('Custom Bundling');

        // Assert JavaScript is executed and modifies the page DOM.
        expect(await browser.$('#replace').getText())
            .toBe('This text rendered by page JavaScript!');
        expect(await browser.$('#component-replace').getText())
            .toBe('This text rendered by component JavaScript!');
        expect(await browser.$('#transitive-replace').getText())
            .toBe('This text rendered by transitive JavaScript!');

        // Assert that all annotations have been processed.
        expect(await browser.getPageSource()).not.toContain(
            'bazel:rules_prerender:PRIVATE_DO_NOT_DEPEND_OR_ELSE');
    }, webDriverTestTimeout);
});
