import 'jasmine';

import { resolveRunfile } from 'rules_prerender/common/runfiles';
import { useDevserver } from 'rules_prerender/common/testing/devserver';
import { useBrowser, usePage } from 'rules_prerender/common/testing/puppeteer';

const devserverBinary = resolveRunfile(
        'rules_prerender/examples/components/devserver');

describe('components', () => {
    const server = useDevserver(devserverBinary);
    const browser = useBrowser();
    const page = usePage(browser);

    it('renders', async () => {
        await page.goto(`http://${server.host}:${server.port}/`, {
            waitUntil: 'load',
        });

        const title = await page.title();
        expect(title).toBe('Components');

        const component = await page.$('.component');
        expect(component).not.toBeNull();

        const componentText = await component!.$eval(
                '.content', (el) => el.textContent);
        expect(componentText).toBe(`I'm a component!`);

        const tsDep = await component!.$eval('.ts-dep', (el) => el.textContent);
        expect(tsDep).toBe(`I'm a simple TypeScript dependency!`);

        const dep = await component!.$('.dep');
        expect(dep).not.toBeNull();

        const depText = await dep!.$eval('.content', (el) => el.textContent);
        expect(depText).toBe(`I'm a component dependency!`);

        const transitive = await dep!.$('.transitive');
        expect(transitive).not.toBeNull();

        const transitiveText = await transitive!.$eval(
                '.content', (el) => el.textContent);
        expect(transitiveText?.trim()).toBe(
                `I'm a component which is depended upon transitively!`);
    });
});
