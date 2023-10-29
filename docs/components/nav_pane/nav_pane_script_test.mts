import { useDevserver } from '../../../common/testing/devserver.mjs';
import { useWebDriver, webDriverTestTimeout } from '../../../common/testing/webdriver.mjs';

describe('NavPane', () => {
    const devserver = useDevserver(
        'docs/components/nav_pane/scripts_test_cases_devserver.sh');
    const wd = useWebDriver(devserver);

    it('does nothing for a flat navigation', async () => {
        const browser = wd.get();
        await browser.url('/flat.html');

        const navPane = await browser.$('rp-nav-pane');
        const navItems = await navPane.shadow$$('.list-el');
        const labels = await Promise.all(navItems.map((el) => el.getText()));

        expect(labels).toEqual([ 'First', 'Second', 'Third' ]);
    }, webDriverTestTimeout);

    it('expands a nested route', async () => {
        const browser = wd.get();
        await browser.url('/nested.html');

        const navPane = await browser.$('rp-nav-pane');

        // Sublist should be hidden (display: 'none';) by default.
        const subList = await navPane.shadow$('li ul');
        const initialSubListDisplay = await browser.execute(
            (el) => getComputedStyle(el).display,
            subList as unknown as HTMLElement,
        );
        expect(initialSubListDisplay).toBe('none');

        // Click the root button, should expand children.
        const rootItemBtn = await navPane.shadow$('[data-list-toggle]');
        await rootItemBtn.click();

        // Check the height of the sublist again, it should be expanded now.
        const expandedSubListDisplay = await browser.execute(
            (el) => getComputedStyle(el).display,
            subList as unknown as HTMLElement,
        );
        expect(expandedSubListDisplay).not.toBe('none');

        // Click the root button again, should collapse children.
        await rootItemBtn.click();

        // Check the height of the sublist one more time, should be collapsed.
        const collapseSubListDisplay = await browser.execute(
            (el) => getComputedStyle(el).display,
            subList as unknown as HTMLElement,
        );
        expect(collapseSubListDisplay).toBe('none');
    }, webDriverTestTimeout);
});
