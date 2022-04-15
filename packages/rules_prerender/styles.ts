import { runfiles } from '@bazel/runfiles';
import * as fs from 'rules_prerender/common/fs';
import { createAnnotation } from 'rules_prerender/common/models/prerender_annotation';
import { getMap as getInlineStyleMap } from 'rules_prerender/packages/rules_prerender/inline_style_map';

/**
 * Returns a prerender annotation as a string to be included in prerendered
 * HTML. This is used by the prerender build process to include the referenced
 * CSS file in the final bundle for the page.
 */
export function includeStyle(path: string): string {
    const annotation = createAnnotation({
        type: 'style',
        path,
    });
    return `<!-- ${annotation} -->`;
}

/** TODO */
export function inlineStyle(path: string): string {
    const inlineStyleMap = getInlineStyleMap();
    const resolvedExecRootPath = inlineStyleMap.get(path);
    if (!resolvedExecRootPath) {
        throw new Error(`Could not find CSS file (${path}) in inline style map containing:\n{\n${
            Array.from(inlineStyleMap.keys()).join('\n')}\n}`);
    }
    const annotation = createAnnotation({
        type: 'inline-style',
        path: resolvedExecRootPath,
    });
    return `<!-- ${annotation} -->`;
}

/**
 * Reads the given CSS file at the provided runfiles path and returns it in a
 * `<style />` tag to be inlined in the document.
 */
export async function inlineStyle2(path: string): Promise<string> {
    const styles = await fs.readFile(runfiles.resolve(path), 'utf-8');
    return `
<style>
${styles}
</style>
    `.trim();
}
