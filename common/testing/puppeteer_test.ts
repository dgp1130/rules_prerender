import 'jasmine';

import { env } from 'process';
import puppeteer, { Browser } from 'puppeteer';
import { useBrowser } from './puppeteer';
import { EffectTester } from './effect_tester';

describe('puppeteer', () => {
    beforeEach(() => {
        delete env['DISPLAY'];
    });

    describe('useBrowser()', () => {
        it('provides a `Browser` effect', async () => {
            const mockBrowser = {
                newPage: jasmine.createSpy('newPage'),
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
            expect(tester.resource.newPage).toBeDefined();

            // Cleanup to simulate test end, should close the browser.
            await tester.cleanup();
            expect(mockBrowser.close).toHaveBeenCalledOnceWith();
        });

        it('provides a `Browser` effect which renders a UI when a $DISPLAY environment variable is set', async () => {
            // When user provides a $DISPLAY variable, a GUI should be shown.
            env['DISPLAY'] = '127.0.0.1:8000';
            
            const mockBrowser = {
                newPage: jasmine.createSpy('newPage'),
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
            expect(tester.resource.newPage).toBeDefined();

            // Cleanup to simulate test end, should close the browser.
            await tester.cleanup();
            expect(mockBrowser.close).toHaveBeenCalledOnceWith();
        });
    });
});
