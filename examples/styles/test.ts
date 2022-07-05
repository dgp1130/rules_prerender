import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import { useDevserver } from '../../common/testing/devserver';
import { getColor, useWebDriver } from '../../common/testing/webdriver';

const devserverBinary = runfiles.resolvePackageRelative('devserver');

describe('styles', () => {
    const devserver = useDevserver(devserverBinary);
    const wd = useWebDriver(devserver);

    it('renders inline styles', async () => {
        const browser = wd.get();
        await browser.url('/');

        expect(await browser.getTitle()).toBe('Inline Styles');

        // Shadow DOM should be styled.
        expect(await browser.$('#shadowroot').shadow$('#hello').getText())
            .toBe('Hello, World!');
        expect(await getColor(browser, browser.$('#shadowroot').shadow$('#hello')))
            .toBe('rgb(255, 0, 0)'); // Red.

        // Non-shadow DOM should not be styled.
        expect(await browser.$('#goodbye').getText())
            .toBe('Goodbye, World!');
        expect(await getColor(browser, browser.$('#goodbye')))
            .toBe('rgb(0, 0, 0)'); // Black.
    });
});
