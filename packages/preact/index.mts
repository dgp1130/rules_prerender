import { JSX, VNode, createElement } from 'preact';
import { render } from 'preact-render-to-string';
import * as rulesPrerender from 'rules_prerender';

export { PrerenderResource } from 'rules_prerender';

/**
 * Renders the given {@link VNode} to a {@link rulesPrerender.SafeHtml} value.
 * The type is `VNode | VNode[]` to make the typings easier to work with, but it
 * actually only supports a single {@link VNode} input of an `<html />` tag. The
 * returned HTML is prefixed with `<!DOCTYPE html>`.
 * 
 * @param node The {@link VNode} of an `<html />` element to render.
 * @returns A {@link rulesPrerender.SafeHtml} object with input node, prefixed
 *     by `<!DOCTYPE html>`.
 */
export function renderToHtml(node: VNode | VNode[]): rulesPrerender.SafeHtml {
    if (Array.isArray(node)) {
        throw new Error(`Expected a single \`VNode\` of the \`<html />\` tag, but got an array of \`VNodes\`.`);
    }
    if (node.type !== 'html') {
        throw new Error(`Expected a single \`VNode\` of the \`<html />\` tag, but got a \`<${node.type}>\` tag instead.`);
    }

    const html = render(node, {}, { pretty: true });
    return rulesPrerender.unsafeTreatStringAsSafeHtml(
        `<!DOCTYPE html>\n${html}`);
}

/**
 * Returns a prerender annotation as a {@link VNode} to be included in
 * prerendered HTML. This is used by the prerender build process to include the
 * referenced client-side JavaScript file in the final bundle for the page.
 */
export function includeScript(path: string, meta: ImportMeta): VNode {
    const annotation =
        rulesPrerender.internalIncludeScriptAnnotation(path, meta);
    return createElement('rules_prerender:annotation', {}, [ annotation ]);
}

/**
 * Returns a prerender annotation as a {@link VNode} to be included in
 * prerendered HTML. This is used by the prerender build process to inline the
 * referenced CSS file at the annotation's location in the page.
 */
export function inlineStyle(importPath: string, meta: ImportMeta): VNode {
    const annotation =
        rulesPrerender.internalInlineStyleAnnotation(importPath, meta);
    return createElement('rules_prerender:annotation', {}, [ annotation ]);
}

interface TemplateProps extends JSX.HTMLAttributes<HTMLTemplateElement> {
    shadowroot?: ShadowRootMode;
}

/** A component representing the native HTML `<template />` tag. */
export function Template({ children, ...attrs }: TemplateProps = {}): VNode {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore JSX types are weird AF.
    return createElement('template', attrs, children);
}
