import * as path from 'path';
import { serialize } from '../../common/models/prerender_annotation.mjs';
import { getMap as getInlineStyleMap } from './inline_style_map.mjs';
import { wkspRelative } from './paths.mjs';

/**
 * Returns a prerender annotation as a string to be included in prerendered
 * HTML. This is used by the prerender build process to inline the referenced
 * CSS file at the annotation's location in the page.
 */
export function inlineStyle(importPath: string, meta: ImportMeta): string {
    return `<rules_prerender:annotation>${
        inlineStyleAnnotation(importPath, meta)
    }</rules_prerender:annotation>`;
}

/**
 * Returns the annotation to inline a style as a string without any HTML
 * wrapping. This is useful for templating engines which don't have easy "parse
 * HTML into safe type" utilities.
 */
export function inlineStyleAnnotation(importPath: string, meta: ImportMeta): string {
    if (!importPath.startsWith('.')) {
        throw new Error(`Only relative imports are supported and must start with \`./\` or \`../\`: "${importPath}".`);
    }

    if (!importPath.endsWith('.css')) {
        throw new Error(`Relative imports *must* include file extensions (end with ".css"): "${importPath}".`);
    }

    const wkspRelativePath = wkspRelative(new URL(meta.url).pathname);
    const resolved =
        path.normalize(path.join(path.dirname(wkspRelativePath), importPath));

    // Validate that the path is still within the Bazel workspace.
    if (resolved.startsWith('..')) {
        throw new Error(`Path escapes workspace root. Did you add too many \`..\` paths? Tried resolving "${
            importPath}" from "${wkspRelativePath}".`);
    }

    // Look up the import path in the inline style map to get its actual file
    // path on disk. This will always exist when executed as part of the
    // renderer, however tests which directly call components won't set the
    // inline style map and it won't exist. In these cases, we just ignore it
    // since such tests would not actually care.
    const inlineStyleMap = getInlineStyleMap();
    const filePath = inlineStyleMap ? inlineStyleMap.get(resolved) : resolved;
    if (!filePath) {
        throw InlineStyleNotFoundError.from(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            importPath, resolved, inlineStyleMap!);
    }

    // Return an annotation with the real file path.
    return serialize({
        type: 'style',
        path: filePath,
    });
}

/** An error thrown when an inline style is not found in the inline style map. */
export class InlineStyleNotFoundError extends Error {
    public importPath: string;
    public resolvedPath: string;
    public availableImportPaths: string[];

    private constructor({
        message,
        importPath,
        resolvedPath,
        availableImportPaths,
    }: {
        message: string,
        importPath: string,
        resolvedPath: string;
        availableImportPaths: string[],
    }) {
        super(message);
        this.importPath = importPath;
        this.resolvedPath = resolvedPath;
        this.availableImportPaths = availableImportPaths;
    }

    public static from(
        importPath: string,
        resolvedPath: string,
        inlineStyleMap: ReadonlyMap<string, string>,
    ): InlineStyleNotFoundError {
        const message = `Could not find "${
            importPath}" in the inline style map. Available imports are:\n\n${
            Array.from(inlineStyleMap.keys()).join('\n')}`;
        return new InlineStyleNotFoundError({
            message,
            importPath,
            resolvedPath,
            availableImportPaths: Array.from(inlineStyleMap.keys()),
        });
    }
}
