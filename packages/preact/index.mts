import * as path from 'path';
import { JSX, VNode, createElement } from 'preact';
import { render } from 'preact-render-to-string';
import * as rulesPrerender from 'rules_prerender';

export { PrerenderResource } from 'rules_prerender';

/**
 * Representing a generic custom element adhering to web components community
 * protocols.
 *
 * Note that not all custom elements will implement all of the designated
 * protocols.
 *
 * @see https://github.com/webcomponents-cg/community-protocols
 */
export interface CustomElement extends HTMLElement {
    /**
     * Whether or not to defer hydrating the component until this attribute is
     * removed.
     *
     * @see https://github.com/webcomponents-cg/community-protocols/pull/15
     */
    'defer-hydration'?: boolean;
}

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
    if (typeof node.type === 'string' && node.type !== 'html') {
        throw new Error(`Expected a single \`VNode\` of the \`<html />\` tag, but got a \`<${node.type}>\` tag instead.`);
    }

    const html = render(node, {});

    // If the user renders a component, we can't know what element it will
    // actually be until after rendering.
    if (!html.startsWith('<html')) {
        throw new Error(`Expected the root component to start with an \`<html />\` tag, but instead it started with: ${html.slice(0, '<html'.length)}...`);
    }

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

/**
 * Reads the linked SVG file from runfiles and returns it as a {@link VNode}.
 * Note that the root node is _not_ a `<svg>`, as it must be wrapped by Preact.
 *
 * The linked file must be a `data` dependency of the prerender target to be
 * accessible to this function.
 *
 * @param src Relative path from the calling file to the SVG file to inline.
 * @param importMeta Must always be a literal `import.meta` at the call site.
 * @param attrs Remaining attributes to apply to the returned element.
 * @param fs Internal-only param, do not use.
 * @returns A {@link VNode} containing the inlined SVG. Note that the root of
 *     the returned element is _not_ an `<svg>` element itself. The returned
 *     element _contains_ an `<svg>` element.
 */
export function InlinedSvg({
    src,
    importMeta,
    fs = rulesPrerender.internalDiskFs,
    ...attrs
}: {
    src: string,
    importMeta: ImportMeta,
    fs?: rulesPrerender.InternalFileSystem,
} & JSX.HTMLAttributes<HTMLElement>): VNode {
    const runfiles = process.env['RUNFILES'];
    if (!runfiles) throw new Error('`${RUNFILES}` not set.');

    // Get the execroot relative path of the file performing the import.
    // Ex: rules_prerender/bazel-out/k8-fastbuild/bin/path/to/file.mjs
    const importerExecrootRelativePath =
        rulesPrerender.internalExecrootRelative(
            new URL(importMeta.url).pathname);

    // Parse the execroot relative path to collect the workspace and relative
    // path.
    const { wksp, relativePath } =
        rulesPrerender.internalSplitExecrootRelativePath(
            importerExecrootRelativePath);

    // Get the relative path to the _directory_ of the file performing the
    // import.
    // Ex: rules_prerender/path/to
    const importerDirWkspRelativePath =
        relativePath.split(path.sep).slice(0, -1).join(path.sep);

    // Get the relative path to the imported file.
    // Ex: path/to/some/image.svg
    const importedWkspRelativePath =
        path.normalize(path.join(importerDirWkspRelativePath, src));

    // Get the runfiles path to the imported file.
    // Ex: ${RUNFILES}/rules_prerender/path/to/some/image.svg
    const importedRunfilesPath =
        path.join(runfiles, wksp, importedWkspRelativePath);

    // Read the SVG file. We do this synchronously to avoid async coloring. We
    // should consider returning an annotation here and processing it as part of
    // the build process like `includeScript` and `inlineStyle`.
    const svg = fs.readFileSync(importedRunfilesPath, 'utf8');

    // Convert the SVG text into a Preact VNode. This unfortunately requires a
    // wrapper element.
    return createElement('div', {
        ...attrs,
        dangerouslySetInnerHTML: { __html: svg },
    });
}
