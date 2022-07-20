import { mdSpacing } from './formatters';

describe('formatters', () => {
    describe('spaceMarkdown()', () => {
        it('spaces like markdown syntax', () => {
            const spaced = mdSpacing(`
                Some text in a line.
                Some text on a second line.

                Some text in another paragraph.


                A very long statement which makes me want to word wrap because
                it exceeds the line length in source code, but also indented as
                I want it to be.



                Some text in a very far away paragraph.
            `);

            expect(spaced).toBe(`
Some text in a line. Some text on a second line.

Some text in another paragraph.

A very long statement which makes me want to word wrap because it exceeds the line length in source code, but also indented as I want it to be.

Some text in a very far away paragraph.
            `.trim());
        });
    });
});
