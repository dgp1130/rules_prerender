import { runfiles } from '@bazel/runfiles';
import { useDevserver } from '../../common/testing/devserver';
import { useWebDriver, webDriverTestTimeout } from '../../common/testing/webdriver';

const devserverBinary = runfiles.resolvePackageRelative('devserver');

describe('data', () => {
    const devserver = useDevserver(devserverBinary);
    const wd = useWebDriver(devserver);

    describe('index page', () => {
        it('renders', async () => {
            const browser = wd.get();
            await browser.url('/');

            expect(await browser.getTitle()).toBe('Data');
            expect(await browser.$('h2').getText()).toBe('Data');

            const links = await browser.$$('li > a')
                .map((el) => el.getAttribute('href'));
            expect(links).toEqual(jasmine.arrayWithExactContents([
                '/posts/foo.html',
                '/posts/bar.html',
                '/posts/baz.html',
            ]));
        }, webDriverTestTimeout);
    });

    describe('foo page', () => {
        it('renders', async () => {
            const browser = wd.get();
            await browser.url('/posts/foo.html');

            expect(await browser.getTitle()).toBe('foo');
            expect(await browser.$('h2').getText()).toBe('foo');
            expect(await browser.$('article').getText())
                .toBe('This is the text for the "foo" post!');
        }, webDriverTestTimeout);
    });

    describe('bar page', () => {
        it('renders', async () => {
            const browser = wd.get();
            await browser.url('/posts/bar.html');

            expect(await browser.getTitle()).toBe('bar');
            expect(await browser.$('h2').getText()).toBe('bar');
            expect(await browser.$('article').getText())
                .toBe('This is the text for the "bar" post!');
        }, webDriverTestTimeout);
    });

    describe('baz page', () => {
        it('renders', async () => {
            const browser = wd.get();
            await browser.url('/posts/baz.html');

            expect(await browser.getTitle()).toBe('baz');
            expect(await browser.$('h2').getText()).toBe('baz');
            expect(await browser.$('article').getText())
                .toBe('This is the text for the "baz" post!');
        }, webDriverTestTimeout);
    });
});
