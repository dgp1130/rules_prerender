import { SafeHtml, isSafeHtml, safe, unsafeTreatStringAsSafeHtml } from './safe_html_impl.mjs';

describe('safe_html', () => {
    describe('SafeHtml', () => {
        it('does not export the `SafeHtml` implementation', () => {
            // @ts-expect-error Not a value reference.
            expect(() => SafeHtml).toThrow(); // Reference error.
        });

        it('throws an error when subclassed', () => {
            const safeHtml = safe`<div></div>`;
            const SafeHtml = (safeHtml.constructor as any);
            class FakeSafeHtml extends SafeHtml {
                constructor() {
                    super({ html: '<span></span>' });
                }
            }

            expect(() => new FakeSafeHtml()).toThrow();
        });

        it('freezes `SafeHtml` instances', () => {
            const safeHtml = safe`<div></div>`;

            // Adding a property.
            expect(() => { (safeHtml as any).foo = 'test'; }).toThrow();

            // Mutating an existing property.
            expect(() => { safeHtml.getHtmlAsString = () => 'test'; })
                .toThrow();

            // Mutating the prototype.
            const SafeHtml = Object.getPrototypeOf(safeHtml);
            expect(() => { SafeHtml.foo = 'test'; }).toThrow();
            const SafeHtmlAgain = (safeHtml as any).__proto__;
            expect(() => { SafeHtmlAgain.foo = 'test'; }).toThrow();
        });

        it('freezes the `SafeHtml` class', () => {
            const safeHtml = safe`<div></div>`;
            const SafeHtml = safeHtml.constructor as any;

            // Adding a property.
            expect(() => { SafeHtml.foo = 'test'; }).toThrow();

            // Mutating an existing property.
            expect(() => {
                SafeHtml.unsafeTrustRawStringContent = () => 'test';
            }).toThrow();

            // Mutating prototype.
            expect(() => { Object.getPrototypeOf(SafeHtml).foo = 'test'; })
                .toThrow();
            expect(() => { SafeHtml.__proto__.foo = 'test'; }).toThrow();
        });
    });

    describe('safe()', () => {
        it('treats a single string literal as safe', () => {
            const safeHtml = safe`<div></div>`;

            expect(isSafeHtml(safeHtml)).toBeTrue();
            expect(safeHtml.getHtmlAsString()).toBe('<div></div>');
        });

        it('throws when given an interpolation', () => {
            expect(() => safe`<${'div'}></div>`).toThrow();
        });
    });

    describe('unsafeTreatStringAsSafeHtml()', () => {
        it('unsafeTreatStringAsSafeHtml() trusts unsafe content', () => {
            const html = unsafeTreatStringAsSafeHtml('<div>Hello, World</div>');
            expect(html.getHtmlAsString()).toBe('<div>Hello, World</div>');
        });
    });

    describe('isSafeHtml()', () => {
        it('returns `true` for `SafeHtml` inputs', () => {
            const html = safe`<div></div>`;

            expect(isSafeHtml(html)).toBeTrue();
        });

        it('returns `false` for non-`SafeHtml` inputs', () => {
            expect(isSafeHtml(true)).toBeFalse();
            expect(isSafeHtml(1)).toBeFalse();
            expect(isSafeHtml('<div></div>')).toBeFalse();
            expect(isSafeHtml({})).toBeFalse();
            expect(isSafeHtml([])).toBeFalse();
            expect(isSafeHtml(Symbol())).toBeFalse();

            // Assignable to `SafeHtml` because it matches the same structure,
            // but is not the same nominal type.
            const fakeSafeHtml = new class {
                public static unsafeTrustRawStringContent(_html: string):
                        SafeHtml {
                    return safe``;
                }

                public getHtmlAsString(): string {
                    return '<div></div>';
                }
            }();
            expect(isSafeHtml(fakeSafeHtml)).toBeFalse();
        });
    });
});
