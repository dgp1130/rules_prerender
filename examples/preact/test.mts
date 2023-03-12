import { useDevserver } from '../../common/testing/devserver.mjs';
import { useWebDriver, getColor } from '../../common/testing/webdriver.mjs';

describe('preact', () => {
    const devserver = useDevserver('examples/preact/devserver.sh');
    const wd = useWebDriver(devserver);

    it('renders', async () => {
        const browser = wd.get();
        await browser.url('/');

        expect(await browser.getTitle()).toBe('Preact');

        // Test JavaScript execution.
        expect(await browser.$('#replace').getText())
            .toBe('Hello from JavaScript!');

        // Test CSS applied within declarative shadow DOM.
        const hello = await browser.$('#component').shadow$('h2');
        expect(await hello.getText()).toBe('Hello, World!');
        expect(await getColor(browser, hello)).toBe('rgb(255, 0, 0)'); // Red.

        // Test CSS did *not* apply in component light DOM.
        const goodbye = await browser.$('h2');
        expect(await goodbye.getText()).toBe('Goodbye, World!');
        expect(await getColor(browser, goodbye)).toBe('rgb(0, 0, 0)'); // Black.
    });
});
