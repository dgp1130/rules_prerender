import { useDevserver } from '../../../common/testing/devserver.mjs';
import { hydrate, useWebDriver, webDriverTestTimeout } from '../../../common/testing/webdriver.mjs';

const narrowViewportWidth = 1023; // px
const wideViewportWidth = 1024; // px
const viewportHeight = 1024; // px

describe('Layout', () => {
    const devserver = useDevserver(
        'docs/components/layout/scripts_test_cases_devserver.sh');
    const wd = useWebDriver(devserver);

    it('defaults nav pane to expanded for a wide viewport', async () => {
        const browser = wd.get();
        await browser.setWindowSize(wideViewportWidth, viewportHeight);
        await browser.url('/basic.html');

        const layout = await browser.$('rp-layout');
        const navContainer = await layout.shadow$('#nav-container');

        const navWidth = await browser.execute(
            (el) => getComputedStyle(el).width,
            navContainer as unknown as HTMLElement,
        );
        expect(navWidth).not.toBe('0px');
    }, webDriverTestTimeout);

    it('defaults nav pane to collapsed for a narrow viewport', async () => {
        const browser = wd.get();
        await browser.setWindowSize(narrowViewportWidth, viewportHeight);
        await browser.url('/basic.html');

        const layout = await browser.$('rp-layout');
        const navContainer = await layout.shadow$('#nav-container');

        const navWidth = await browser.execute(
            (el) => getComputedStyle(el).width,
            navContainer as unknown as HTMLElement,
        );
        expect(navWidth).toBe('0px');
    }, webDriverTestTimeout);

    it('toggles nav pane from expanded default', async () => {
        const browser = wd.get();
        await browser.setWindowSize(wideViewportWidth, viewportHeight);
        await browser.url('/basic.html');

        const layout = await browser.$('rp-layout');
        const header = await layout.shadow$('rp-header');
        const navContainer = await layout.shadow$('#nav-container');

        await hydrate(browser, layout);

        // Verify still expanded.
        const expandedWidth = await browser.execute(
            (el) => getComputedStyle(el).width,
            navContainer as unknown as HTMLElement,
        );
        expect(expandedWidth).not.toBe('0px');

        // Collapse the navigation menu.
        await browser.execute(
            (el) => el.dispatchEvent(new CustomEvent('toggle-menu')),
            header as unknown as Element,
        );

        // Wait for animation to complete.
        await new Promise<void>((resolve) => { setTimeout(resolve, 300); });

        // Verify collapsed.
        const collapsedWidth = await browser.execute(
            (el) => getComputedStyle(el).width,
            navContainer as unknown as HTMLElement,
        );
        expect(collapsedWidth).toBe('0px');

        // Re-expand the navigation menu.
        await browser.execute(
            (el) => el.dispatchEvent(new CustomEvent('toggle-menu')),
            header as unknown as Element,
        );

        // Wait for animation to complete.
        await new Promise<void>((resolve) => { setTimeout(resolve, 300); });

        // Verify expanded again.
        const newExpandedWidth = await browser.execute(
            (el) => getComputedStyle(el).width,
            navContainer as unknown as HTMLElement,
        );
        expect(newExpandedWidth).not.toBe('0px');
    }, webDriverTestTimeout);

    it('toggles nav pane from collapsed default', async () => {
        const browser = wd.get();
        await browser.setWindowSize(narrowViewportWidth, viewportHeight);
        await browser.url('/basic.html');

        const layout = await browser.$('rp-layout');
        const header = await layout.shadow$('rp-header');
        const navContainer = await layout.shadow$('#nav-container');

        await hydrate(browser, layout);

        // Verify still collapsed.
        const collapsedWidth = await browser.execute(
            (el) => getComputedStyle(el).width,
            navContainer as unknown as HTMLElement,
        );
        expect(collapsedWidth).toBe('0px');

        // Expand the navigation menu.
        await browser.execute(
            (el) => el.dispatchEvent(new CustomEvent('toggle-menu')),
            header as unknown as Element,
        );

        // Wait for animation to complete.
        await new Promise<void>((resolve) => { setTimeout(resolve, 300); });

        // Verify expanded.
        const expandedWidth = await browser.execute(
            (el) => getComputedStyle(el).width,
            navContainer as unknown as HTMLElement,
        );
        expect(expandedWidth).not.toBe('0px');

        // Re-collapse the navigation menu.
        await browser.execute(
            (el) => el.dispatchEvent(new CustomEvent('toggle-menu')),
            header as unknown as Element,
        );

        // Wait for animation to complete.
        await new Promise<void>((resolve) => { setTimeout(resolve, 300); });

        // Verify collapsed again.
        const newCollapsedWidth = await browser.execute(
            (el) => getComputedStyle(el).width,
            navContainer as unknown as HTMLElement,
        );
        expect(newCollapsedWidth).toBe('0px');
    }, webDriverTestTimeout);

    it('does not automatically collapse the nav pane when narrowing the viewport after load', async () => {
        const browser = wd.get();
        await browser.setWindowSize(wideViewportWidth, viewportHeight);
        await browser.url('/basic.html');

        const layout = await browser.$('rp-layout');
        const navContainer = await layout.shadow$('#nav-container');

        await hydrate(browser, layout);

        // Verify initially expanded.
        const initialWidth = await browser.execute(
            (el) => getComputedStyle(el).width,
            navContainer as unknown as HTMLElement,
        );
        expect(initialWidth).not.toBe('0px');

        // Narrow the viewport width.
        browser.setWindowSize(narrowViewportWidth, viewportHeight);

        // Verify still expanded.
        const newWidth = await browser.execute(
            (el) => getComputedStyle(el).width,
            navContainer as unknown as HTMLElement,
        );
        expect(newWidth).not.toBe('0px');
    }, webDriverTestTimeout);

    it('does not automatically expand the nav pane when widening the viewport after load', async () => {
        const browser = wd.get();
        await browser.setWindowSize(narrowViewportWidth, viewportHeight);
        await browser.url('/basic.html');

        const layout = await browser.$('rp-layout');
        const navContainer = await layout.shadow$('#nav-container');

        await hydrate(browser, layout);

        // Verify initially collapsed.
        const initialWidth = await browser.execute(
            (el) => getComputedStyle(el).width,
            navContainer as unknown as HTMLElement,
        );
        expect(initialWidth).toBe('0px');

        // Widen the viewport width.
        browser.setWindowSize(wideViewportWidth, viewportHeight);

        // Verify still collapsed.
        const newWidth = await browser.execute(
            (el) => getComputedStyle(el).width,
            navContainer as unknown as HTMLElement,
        );
        expect(newWidth).toBe('0px');
    }, webDriverTestTimeout);
});
