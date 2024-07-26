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

    it('starts with the current route expanded and highlighted', async () => {
        const browser = wd.get();
        await browser.url('/current.html');

        const navPane = await browser.$('rp-nav-pane');

        // Need to use `[test-id]` here because `:scope > ul` doesn't work with
        // shadow DOM and `:scope ul` would collected nested lists.
        const rootRoutes = await navPane.shadow$$('ul[test-id="root"] > li');
        expect(rootRoutes.length).toBe(2);

        const rootLabels = await Promise.all(rootRoutes
            .map((route) => route.$(':scope > :is(a, button)').getText()));
        expect(rootLabels).toEqual([ 'First', 'Second' ]);

        const [ firstRootRouteList, secondRootRouteList ] = await Promise.all(
            rootRoutes.map((route) => route.$(':scope > ul')));

        // First list should be expanded because it contains the current route.
        const firstRootRouteListDisplay = await browser.execute(
            (el) => getComputedStyle(el).display,
            firstRootRouteList as unknown as HTMLElement,
        );
        expect(firstRootRouteListDisplay).not.toBe('none');

        // Second list should *not* be expanded because it does not contain the
        // current route.

        // First list should be expanded because it contains the current route.
        const secondRootRouteListDisplay = await browser.execute(
            (el) => getComputedStyle(el).display,
            secondRootRouteList as unknown as HTMLElement,
        );
        expect(secondRootRouteListDisplay).toBe('none');

        // Current page should be highlighted.
        const selectedPages = await navPane.shadow$$('.current-page');

        // Can only ever currently be on a single page.
        expect(selectedPages.length)
            .withContext('Multiple pages selected, only one can be the current page')
            .toBe(1);

        // The current page should be highlighted.
        const [ selectedPage ] = selectedPages;
        expect(await selectedPage!.getText()).toBe('Current');
    });
});
