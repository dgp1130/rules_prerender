import { parsePageMetadata, MarkdownMetadata } from './markdown_page.mjs';

describe('markdown_page', () => {
    describe('parsePageMetadata()', () => {
        const golden: MarkdownMetadata = {
            title: 'Hello, World!',
        };

        it('returns valid data', () => {
            expect(() => parsePageMetadata('page.md', golden)).not.toThrow();
        });

        it('throws an error when given invalid data', () => {
            // Bad input object.
            expect(() => parsePageMetadata('page.md', false)).toThrow();
            expect(() => parsePageMetadata('page.md', null)).toThrow();
            expect(() => parsePageMetadata('page.md', undefined)).toThrow();
            expect(() => parsePageMetadata('page.md', [])).toThrow();

            expect(() => parsePageMetadata('page.md', {
                ...golden,
                title: undefined, // Missing required property.
            }));
            expect(() => parsePageMetadata('page.md', {
                ...golden,
                title: true, // Wrong property type.
            })).toThrow();
            expect(() => parsePageMetadata('page.md', {
                ...golden,
                unknown: 'value', // Extra property.
            })).toThrow();
        });
    });
});
