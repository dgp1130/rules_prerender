import 'jasmine';

import { env } from 'process';
import puppeteer, { Browser, Page } from 'puppeteer';
import { effectFake } from 'rules_prerender/common/testing/effect_fake';
import { EffectTester } from 'rules_prerender/common/testing/effect_tester';
import { useBrowser, usePage, puppeteerTestTimeout } from 'rules_prerender/common/testing/puppeteer';

describe('puppeteer', () => {
    beforeEach(() => {
        delete env['DISPLAY'];
    });

    describe('useBrowser()', () => {
        it('provides a `Browser` effect', async () => {
            const mockBrowser = {
                close: jasmine.createSpy('close'),
            } as unknown as Browser;

            spyOn(puppeteer, 'launch').and.resolveTo(mockBrowser);

            // Execute effect, should not be initialized yet.
            const tester = EffectTester.of(() => useBrowser());
            expect(puppeteer.launch).not.toHaveBeenCalled();

            // Initialize to simulate test start, should launch a browser.
            await tester.initialize();
            expect(puppeteer.launch).toHaveBeenCalledOnceWith({
                headless: true, // Defaults to headless.
                timeout: jasmine.any(Number),
            });
            expect(mockBrowser.close).not.toHaveBeenCalled();

            // Browser should be available.
            expect(tester.get()).toBe(mockBrowser);

            // Cleanup to simulate test end, should close the browser.
            await tester.cleanup();
            expect(mockBrowser.close).toHaveBeenCalledOnceWith();
        });

        it('provides a `Browser` effect which renders a UI when a $DISPLAY environment variable is set', async () => {
            // When user provides a $DISPLAY variable, a GUI should be shown.
            env['DISPLAY'] = '127.0.0.1:8000';
            
            const mockBrowser = {
                close: jasmine.createSpy('close'),
            } as unknown as Browser;

            spyOn(puppeteer, 'launch').and.resolveTo(mockBrowser);

            // Execute effect, should not be initialized yet.
            const tester = EffectTester.of(() => useBrowser());
            expect(puppeteer.launch).not.toHaveBeenCalled();

            // Initialize to simulate test start, should launch a browser.
            await tester.initialize();
            expect(puppeteer.launch).toHaveBeenCalledOnceWith({
                headless: false, // Should run GUI because $DISPLAY is set.
                timeout: jasmine.any(Number),
            });
            expect(mockBrowser.close).not.toHaveBeenCalled();

            // Browser should be available.
            expect(tester.get()).toBe(mockBrowser);

            // Cleanup to simulate test end, should close the browser.
            await tester.cleanup();
            expect(mockBrowser.close).toHaveBeenCalledOnceWith();
        });
    });

    describe('usePage()', () => {
        it('provides a `Page` effect', async () => {
            const mockPage = {
                close: jasmine.createSpy('close').and.resolveTo(),
                setDefaultNavigationTimeout:
                    jasmine.createSpy('setDefaultNavigationTimeout'),
            } as unknown as Page;
            const mockBrowser = {
                newPage: jasmine.createSpy('newPage').and.returnValue(mockPage),
            } as unknown as Browser;

            // Execute effect, should not be initialized yet.
            const tester = EffectTester.of(
                () => usePage(effectFake(mockBrowser)));
            expect(mockBrowser.newPage).not.toHaveBeenCalled();

            // Initialize to simulate test start, should launch a browser.
            await tester.initialize();
            expect(mockBrowser.newPage).toHaveBeenCalledOnceWith();
            expect(mockPage.setDefaultNavigationTimeout)
                .toHaveBeenCalledOnceWith(puppeteerTestTimeout);
            expect(mockPage.close).not.toHaveBeenCalled();

            // Browser should be available.
            expect(tester.get()).toBe(mockPage);

            // Cleanup to simulate test end, should close the browser.
            await tester.cleanup();
            expect(mockPage.close).toHaveBeenCalledOnceWith();
        });
    });

    describe('puppeteerTestTimeout', () => {
        it('is a test timeout', () => {
            expect(puppeteerTestTimeout).toEqual(jasmine.any(Number));
            expect(puppeteerTestTimeout).toBeGreaterThan(0);
        });
    });
});
