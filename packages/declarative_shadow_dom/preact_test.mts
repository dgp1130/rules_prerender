import { renderToString } from 'preact-render-to-string';
import { serialize } from '../../common/models/prerender_annotation.mjs';
import { Template } from './preact.mjs';

describe('preact', () => {
    describe('Template', () => {
        it('renders a `<template>` element', () => {
            const template = Template({ children: 'Hello, World!' });

            const html = renderToString(template);

            expect(html).toBe('<template>Hello, World!</template>');
        });
        it('renders a `<template>` element with the DSD polyfill when `shadowrootmode` is given', () => {
            const template = Template({ shadowrootmode: 'open' });

            const html = renderToString(template);

            expect(html).toContain('<template shadowrootmode="open">');
            expect(html).toContain(`
<rules_prerender:annotation>${
    serialize({
        type: 'script',
        path: 'packages/declarative_shadow_dom/declarative_shadow_dom_polyfill.mjs',
    }).replaceAll('"', '&quot;')
}</rules_prerender:annotation>
            `.trim());
        });

        it('renders a `<template>` element with other attributes passed through', () => {
            const template = Template({ hidden: true });

            const html = renderToString(template);

            expect(html).toBe('<template hidden></template>');
        });

        it('renders DSD polyfill *before* children', () => {
            // NOTE: It is very import to render the DSD polyfill *before*
            // children because the bundler will generate entry points in the
            // same order. If children came first, components would bootstrap
            // before the DSD polyfill had executed.
            const template = Template({
                shadowrootmode: 'open',
                children: 'Hello, World!',
            });

            const html = renderToString(template);

            const annotationIndex = html.indexOf(`
<rules_prerender:annotation>${
    serialize({
        type: 'script',
        path: 'packages/declarative_shadow_dom/declarative_shadow_dom_polyfill.mjs',
    }).replaceAll('"', '&quot;')
}</rules_prerender:annotation>
            `.trim());
            expect(annotationIndex).not.toBe(-1);

            const childrenIndex = html.indexOf('Hello, World!');
            expect(childrenIndex).not.toBe(-1);

            expect(annotationIndex).toBeLessThan(childrenIndex);
        });
    });
});
