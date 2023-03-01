import { useDevserver } from '../../common/testing/devserver.mjs';
import { useWebDriver, webDriverTestTimeout } from '../../common/testing/webdriver.mjs';

describe('components', () => {
    const devserver = useDevserver('examples/components/devserver.sh');
    const wd = useWebDriver(devserver);

    it('renders', async () => {
        const browser = wd.get();
        await browser.url('/');

        expect(await browser.getTitle()).toBe('Components');

        const component = await browser.$('.component');
        expect(component).not.toBeNull();
        expect(await component.$('.content').getText())
            .toBe(`I'm a component!`);
        expect(await component.$('.ts-dep').getText())
            .toBe(`I'm a simple TypeScript dependency!`);

        const dep = await component.$('.dep');
        expect(dep).not.toBeNull();
        expect(await dep.$('.content').getText())
            .toBe(`I'm a component dependency!`);


        const transitive = await dep.$('.transitive');
        expect(transitive).not.toBeNull();
        expect(await transitive.$('.content').getText())
            .toBe(`I'm a component which is depended upon transitively!`);
    }, webDriverTestTimeout);
});
