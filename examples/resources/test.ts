import 'jasmine';

import { runfiles } from '@bazel/runfiles';
import { useDevserver } from '../../common/testing/devserver';
import { useWebDriver, webDriverTestTimeout } from '../../common/testing/webdriver';

const devserverBinary = runfiles.resolvePackageRelative('devserver');

describe('resources', () => {
    const devserver = useDevserver(devserverBinary);
    const wd = useWebDriver(devserver);

    it('renders with resources', async () => {
        const browser = wd.get();
        await browser.url('/');

        expect(await browser.getTitle()).toBe('Resources');

        const pageImageLoaded = await browser.$('img[src="/favicon.ico"]')
            .getProperty('complete');
        expect(pageImageLoaded).toBeTrue();

        const componentImageLoaded =
            await browser.$('img[src="/images/component.png"]')
                .getProperty('complete');
        expect(componentImageLoaded).toBeTrue();

        const transitiveImageLoaded =
            await browser.$('img[src="/images/transitive.png"]')
                .getProperty('complete');
        expect(transitiveImageLoaded).toBeTrue();
    }, webDriverTestTimeout);
});
