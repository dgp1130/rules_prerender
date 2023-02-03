import { useDevserver } from '../../common/testing/devserver';
import { useWebDriver, webDriverTestTimeout } from '../../common/testing/webdriver';

describe('JavaScript', () => {
    const devserver = useDevserver('examples/javascript/devserver.sh');
    const wd = useWebDriver(devserver);

    it('renders component', async () => {
        const browser = wd.get();
        await browser.url('/');

        expect(await browser.getTitle()).toBe('JavaScript');
        expect(await browser.$('#component').getText())
            .toBe('Hello from a JS component!');
        expect(await browser.$('#component-replace').getText())
            .toBe('This text rendered by component JavaScript: "Hello, World!"');
    }, webDriverTestTimeout);
});
