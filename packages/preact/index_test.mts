import { createElement } from 'preact';
import { render } from 'preact-render-to-string';
import { CustomElement, InlinedSvg, renderToHtml, includeScript, inlineStyle } from './index.mjs';
import { serialize } from '../../common/models/prerender_annotation.mjs';
import { FileSystemFake } from '../../common/file_system_fake.mjs';

describe('preact', () => {
    describe('CustomElement', () => {
        it('provides the `defer-hydration` attribute type', () => {
            // Type-only test, needs only to compile.
            () => {
                const el = undefined as unknown as CustomElement;

                el['defer-hydration'] = true;

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                el['defer-hydration'] = 'test';
            };

            expect().nothing();
        });
    });

    describe('renderToHtml()', () => {
        it('renders the given `VNode`', () => {
            const html = renderToHtml(createElement('html', {}, [
                createElement('body', {}, [
                    createElement('h2', {}, [
                        'Hello, World!',
                    ]),
                ]),
            ]));

            expect(html.getHtmlAsString()).toContain(`<h2>Hello, World!</h2>`);
        });

        it('renders the given `VNode` in HTML5', () => {
            const html = renderToHtml(createElement('html', {}));
            expect(html.getHtmlAsString().slice(0, '<!DOCTYPE html>'.length))
                .toBe('<!DOCTYPE html>');
        });

        it('renders the given component', () => {
            const Component = createElement(() => {
                return createElement('html', {}, [
                    createElement('body', {}, [
                        createElement('h2', {}, [
                            'Hello, World!',
                        ]),
                    ]),
                ]);
            }, {});

            const html = renderToHtml(Component);
            expect(html.getHtmlAsString()).toContain(`<h2>Hello, World!</h2>`);
        });

        it('throws an error when given a `VNode` other than an `<html />` element', () => {
            expect(() => renderToHtml(createElement('body', {}))).toThrowError(
                /Expected a single `VNode` of the `<html \/>` tag/);
        });

        it('throws an error when given a component which does not start with an `<html />` element', () => {
            const Component = createElement(() => {
                return createElement('body', {});
            }, {});

            expect(() => renderToHtml(Component)).toThrowError(
                /Expected the root component to start with an `<html \/>` tag/);
        });

        it('does *not* throw an error when given a component which renders an `<html />` tag with an attribute', () => {
            const Component = createElement(() => {
                return createElement('html', { lang: 'en' });
            }, {});

            const html = renderToHtml(Component);
            expect(html.getHtmlAsString()).toContain('<html lang="en">');
        });
    });

    describe('includeScript()', () => {
        it('renders a script annotation', () => {
            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
            };

            const result = includeScript('./script.mjs', meta);
            expect(render(result)).toBe(`
<rules_prerender:annotation>${
    serialize({
        type: 'script',
        path: 'path/to/pkg/script.mjs',
    }).replaceAll('"', '&quot;')
}</rules_prerender:annotation>
            `.trim());
        });
    });

    describe('inlineStyle()', () => {
        it('renders a style annotation', () => {
            const meta: ImportMeta = {
                url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
            };

            const result = inlineStyle('./style.css', meta);
            expect(render(result)).toBe(`
<rules_prerender:annotation>${
    serialize({
        type: 'style',
        path: 'path/to/pkg/style.css',
    }).replaceAll('"', '&quot;')
}</rules_prerender:annotation>
            `.trim());
        });
    });

    describe('InlinedSvg()', () => {
        const actualRunfiles = process.env['RUNFILES'];
        afterEach(() => {
            process.env['RUNFILES'] = actualRunfiles;
        });

        it('inlines an `<svg>` element', () => {
            process.env['RUNFILES'] = 'MOCK_RUNFILES_PATH';
            const fs = FileSystemFake.of({
                'MOCK_RUNFILES_PATH/my_wksp/path/to/pkg/image.svg': '<svg></svg>',
            });

            const html = render(InlinedSvg({
                src: './image.svg',
                importMeta: {
                    url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
                },
                fs,
            }));

            expect(html).toContain('<svg></svg>');
        });

        it('throws an error when `$RUNFILES` is not set', () => {
            delete process.env['RUNFILES'];
            const fs = FileSystemFake.of({});

            expect(() => render(InlinedSvg({
                src: './image.svg',
                importMeta: {
                    url: 'file:///bazel/.../execroot/my_wksp/bazel-out/k8-opt/bin/path/to/pkg/prerender.mjs',
                },
                fs,
            }))).toThrowError(/`\${RUNFILES}` not set/);
        });
    });
});
