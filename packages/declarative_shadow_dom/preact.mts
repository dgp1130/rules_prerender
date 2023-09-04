import { includeScript } from '@rules_prerender/preact';
import { type VNode, createElement } from 'preact';
import type { JSX } from 'preact/jsx-runtime';

interface TemplateAttrs extends JSX.HTMLAttributes<HTMLTemplateElement> {
    shadowrootmode?: ShadowRootMode;
}

/** A component representing the native HTML `<template />` tag. */
export function Template({ children, shadowrootmode, ...attrs }: TemplateAttrs = {}): VNode {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore JSX types are weird AF.
    return createElement('template', { shadowrootmode, ...attrs }, [
        // NOTE: DSD polyfill *must* come before children so the bundler loads
        // it before scripts included by children. This forces the DSD polyfill
        // to run first, before any components are defined.
        shadowrootmode ? polyfillDeclarativeShadowDom() : undefined,
        children,
    ]);
}

/**
 * Returns a prerender annotation used by the bundler to inject the declarative
 * shadow DOM polyfill into the document.
 */
export function polyfillDeclarativeShadowDom(): VNode {
    return includeScript('./declarative_shadow_dom_polyfill.mjs', import.meta);
}
