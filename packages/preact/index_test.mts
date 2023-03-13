import { createElement } from 'preact';
import { render } from 'preact-render-to-string';
import { renderToHtml, includeScript, inlineStyle, Template } from './index.mjs';
import { serialize } from '../../common/models/prerender_annotation.mjs';

describe('preact', () => {
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

    describe('Template', () => {
        it('renders a `<template />` element', () => {
            const html = render(Template({
                children: [
                    createElement('div', {}, [
                        'Hello, World!',
                    ]),
                ],
            }));

            expect(html).toContain('<template>');
            expect(html).toContain('<div>Hello, World!</div>');
        });

        it('accepts `shadowroot`', () => {
            const html = render(Template({ shadowroot: 'open' }));

            expect(html).toContain('<template shadowroot="open">');
        });

        it('allows other HTML attributes', () => {
            const html = render(Template({ id: 'my-template' }));

            expect(html).toContain('<template id="my-template">');
        });

        it('restricts `shadowroot` type', () => {
            // @ts-expect-error Wrong shadow root module.
            expect(() => Template({ shadowroot: 'not-a-shadowroot-mode' }))
                .not.toThrow();
        });

        it('disallows unknown attributes', () => {
            // @ts-expect-error Unknown attribute.
            expect(() => Template({ notAnAttribute: 'test' })).not.toThrow();
        });
    });
});
