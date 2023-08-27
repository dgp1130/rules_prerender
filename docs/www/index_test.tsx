import { parse } from 'node-html-parser';
import { renderToString } from 'preact-render-to-string';
import { IndexPage } from './index.js';

describe('index', () => {
    describe('IndexPage()', () => {
        it('renders the index page', () => {
            const fragment = parse(renderToString(<IndexPage routes={[]} />));
            expect(fragment.querySelector('h2')!.textContent).toBe('Hello, World!');
        });
    });
});
