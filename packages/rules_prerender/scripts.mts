import * as path from 'path';
import { createAnnotation } from '../../common/models/prerender_annotation.mjs';
import { wkspRelative } from './paths.mjs';

/**
 * Returns a prerender annotation as a string to be included in prerendered
 * HTML. This is used by the prerender build process to include the referenced
 * client-side JavaScript file in the final bundle for the page.
 */
export function includeScript(filePath: string, meta: ImportMeta): string {
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

    const annotation = createAnnotation({
        type: 'script',
        path: resolved,
    });
    return `<rules_prerender:annotation>${
        annotation
    }</rules_prerender:annotation>`;
}
