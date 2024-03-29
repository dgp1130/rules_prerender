import { renderToHtml } from '@rules_prerender/preact';
import { HTMLElement, parse, NodeType } from 'node-html-parser';
import { baseLayout } from './base.js';

describe('base', () => {
    describe('baseLayout()', () => {
        it('returns a basic HTML document layout from its input', () => {
            const fragment = parse(renderToHtml(baseLayout(
                'Some title',
                <div id="content">Main content!</div>,
            )).getHtmlAsString());

            // Title should be set.
            expect(fragment.querySelector('html head title')!.text)
                .toBe('Some title');

            // Renders the header and footer.
            expect(fragment.querySelector('[comp-header]')).toBeDefined();
            expect(fragment.querySelector('[comp-footer]')).toBeDefined();

            // Callback should be placed under `<main />` tag.
            const main = fragment.querySelector('body main')!;
            const mainChildren = main.childNodes
                .filter((node) => node.nodeType === NodeType.ELEMENT_NODE);
            expect(mainChildren.length).toBe(1);
            expect((mainChildren[0] as HTMLElement).id).toBe('content');
        });
    });
});
