import * as path from 'path';
import { serialize } from '../../common/models/prerender_annotation.mjs';
import { wkspRelative } from './paths.mjs';

/**
 * Returns a prerender annotation as a string to be included in prerendered
 * HTML. This is used by the prerender build process to include the referenced
 * client-side JavaScript file in the final bundle for the page.
 */
export function includeScript(filePath: string, meta: ImportMeta): string {
    return `<rules_prerender:annotation>${
        includeScriptAnnotation(filePath, meta)
    }</rules_prerender:annotation>`;
}

/**
 * Returns the annotation to include a script as a string without any HTML
 * wrapping. This is useful for templating engines which don't have easy "parse
 * HTML into safe type" utilities.
 */
export function includeScriptAnnotation(
        filePath: string, meta: ImportMeta): string {
    if (!filePath.startsWith('.')) {
        throw new Error(`Only relative imports are supported and must start with \`./\` or \`../\`: "${filePath}".`);
    }

    if (!/\.[cm]?js$/.test(filePath)) {
        throw new Error(`Relative imports *must* include file extensions (end with ".js", ".cjs", or ".mjs"): "${filePath}".`);
    }

    const wkspRelativePath = wkspRelative(new URL(meta.url).pathname);
    const resolved =
        path.normalize(path.join(path.dirname(wkspRelativePath), filePath));

    // Validate that the path is still within the Bazel workspace.
    if (resolved.startsWith('..')) {
        throw new Error(`Path escapes workspace root. Did you add too many \`..\` paths? Tried resolving "${
            filePath}" from "${wkspRelativePath}".`);
    }

    return serialize({
        type: 'script',
        path: resolved,
    });
}
