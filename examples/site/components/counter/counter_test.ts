import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { puppeteerTestTimeout, useBrowser, usePage } from 'rules_prerender/common/testing/puppeteer';

const devserverBinary =
    runfiles.resolvePackageRelative('counter_test_cases_devserver');

describe('Counter', () => {
    const devserver = useDevserver(devserverBinary);
    const browser = useBrowser();
    const page = usePage(browser);

    it('increments when the increment button is clicked', async () => {
        await page.get().goto(
            `http://${devserver.get().host}:${devserver.get().port}/zero.html`,
            { waitUntil: 'load' },
        );

        const counter = (await page.get()
            .evaluateHandle(`document.querySelector('site-counter').shadowRoot`)
        ).asElement()!;

        const initialLbl =
            await counter.$eval('[label]', (el) => el.textContent);
        expect(initialLbl).toBe('The current count is: 0.');

        const incrementBtn = (await counter.$('[increment]'))!;
        await incrementBtn.click();

        const incrementedLabel =
            await counter.$eval('[label]', (el) => el.textContent);
        expect(incrementedLabel).toBe('The current count is: 1.');
    }, puppeteerTestTimeout);

    it('decrements when the decrement button is clicked', async () => {
        await page.get().goto(
            `http://${devserver.get().host}:${devserver.get().port}/zero.html`,
            { waitUntil: 'load' },
        );
        
        const counter = (await page.get()
            .evaluateHandle(`document.querySelector('site-counter').shadowRoot`)
        ).asElement()!;

        const initialLbl =
            await counter.$eval('[label]', (el) => el.textContent);
        expect(initialLbl).toBe('The current count is: 0.');

        const decrementBtn = (await counter.$('[decrement]'))!;
        await decrementBtn.click();

        const decrementedLabel =
            await counter.$eval('[label]', (el) => el.textContent);
        expect(decrementedLabel).toBe('The current count is: -1.');
    }, puppeteerTestTimeout);

    it('hydrates from an initial positive value', async () => {
        await page.get().goto(
            `http://${devserver.get().host}:${devserver.get().port}/positive.html`,
            { waitUntil: 'load' },
        );
        
        const counter = (await page.get()
            .evaluateHandle(`document.querySelector('site-counter').shadowRoot`)
        ).asElement()!;

        const initialLbl =
            await counter.$eval('[label]', (el) => el.textContent);
        expect(initialLbl).toBe('The current count is: 4.');

        // Increment to confirm that the initialized value is actually used.
        const incrementBtn = (await counter.$('[increment]'))!;
        await incrementBtn.click();

        const incrementedLabel =
            await counter.$eval('[label]', (el) => el.textContent);
        expect(incrementedLabel).toBe('The current count is: 5.');
    }, puppeteerTestTimeout);

    it('hydrates from an initial negative value', async () => {
        await page.get().goto(
            `http://${devserver.get().host}:${devserver.get().port}/negative.html`,
            { waitUntil: 'load' },
        );
        
        const counter = (await page.get()
            .evaluateHandle(`document.querySelector('site-counter').shadowRoot`)
        ).asElement()!;

        const initialLbl =
            await counter.$eval('[label]', (el) => el.textContent);
        expect(initialLbl).toBe('The current count is: -7.');

        // Increment to confirm that the initialized value is actually used.
        const incrementBtn = (await counter.$('[increment]'))!;
        await incrementBtn.click();

        const incrementedLabel =
            await counter.$eval('[label]', (el) => el.textContent);
        expect(incrementedLabel).toBe('The current count is: -6.');
    }, puppeteerTestTimeout);
});
