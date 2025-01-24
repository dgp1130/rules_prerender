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
export function includeScriptAnnotation(filePath: string, meta: ImportMeta):
        string {
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

const keyNames = new Map<Key, string>();
const keyCount = new Map<string, number>();

function getKeyName(key: Key): string {
    const existingName = keyNames.get(key);
    if (existingName) return existingName;

    const name = key.description ? key.description : '(anonymous)';
    const count = keyCount.get(name) ?? 0;
    const newName = count === 0 ? name : `${name}__rp:${count}`;
    keyNames.set(key, newName);
    keyCount.set(name, count + 1);
    return newName;
}

/** TODO */
export function inlineScriptAnnotation(key: Key, code: string): string {
    return serialize({
        type: 'inline-script',
        key: getKeyName(key),
        code,
    });
}

/** TODO */
export type Key = symbol;

const keyMap = new Map<TemplateStringsArray, Key>();

/** TODO */
export function key(literals: TemplateStringsArray, ...values: never[]): Key {
    if (values.length !== 0) throw new Error(`\`key\` does not accept interpolations.`);
    const existingKey = keyMap.get(literals);
    if (existingKey) return existingKey;

    const newKey = Symbol(literals[0]);
    keyMap.set(literals, newKey);
    return newKey;
}
