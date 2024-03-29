import { useDevserver } from '../../../../common/testing/devserver.mjs';
import { useWebDriver, webDriverTestTimeout } from '../../../../common/testing/webdriver.mjs';

describe('Counter', () => {
    const devserver = useDevserver(
        'examples/site/components/counter/counter_test_cases_devserver.sh');
    const wd = useWebDriver(devserver);

    it('increments when the increment button is clicked', async () => {
        const browser = wd.get();
        await browser.url('/zero.html');

        const counter = await browser.$('site-counter');
        const label = await counter.shadow$('#label');

        expect(await label.getText()).toBe('The current count is: 0.');
        await counter.shadow$('#increment').click();
        expect(await label.getText()).toBe('The current count is: 1.');
    }, webDriverTestTimeout);

    it('decrements when the decrement button is clicked', async () => {
        const browser = wd.get();
        await browser.url('/zero.html');

        const counter = await browser.$('site-counter');
        const label = counter.shadow$('#label');

        expect(await label.getText()).toBe('The current count is: 0.');
        await counter.shadow$('#decrement').click();
        expect(await label.getText()).toBe('The current count is: -1.');
    }, webDriverTestTimeout);

    it('hydrates from an initial positive value', async () => {
        const browser = wd.get();
        await browser.url('/positive.html');
        
        const counter = await browser.$('site-counter');
        const label = await counter.shadow$('#label');

        // Assert the prerendered value is present.
        expect(await label.getText()).toBe('The current count is: 4.');

        // Increment to confirm that the initialized value is hydrated and used
        // in client-side scripts.
        await counter.shadow$('#increment').click();
        expect(await label.getText()).toBe('The current count is: 5.');
    }, webDriverTestTimeout);

    it('hydrates from an initial negative value', async () => {
        const browser = wd.get();
        await browser.url('/negative.html');

        const counter = browser.$('site-counter');
        const label = counter.shadow$('#label');

        // Assert the prerendered value is present.
        expect(await label.getText()).toBe('The current count is: -7.');

        // Increment to confirm that the initialized value is hydrated and used
        // in client-side scripts.
        await counter.shadow$('#increment').click();
        expect(await label.getText()).toBe('The current count is: -6.');
    }, webDriverTestTimeout);
});
