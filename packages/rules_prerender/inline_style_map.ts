/**
 * @fileoverview A global map of inline style imports to their file locations. Inlined
 * styles may live at a different file location than is visible to the user, so import
 * paths may not align to the actual file location. This serves as a map of "user
 * import path" -> "actual file location the CSS file lives".
 */

let map: ReadonlyMap<string, string> | undefined;

// DEBUG
if ((globalThis as any).rulesPrerenderInlineStyleMapInitialized) {
    throw new Error(`inline_style_map initialized twice!`);
}
(globalThis as any).rulesPrerenderInlineStyleMapInitialized = true;

/** Returns the inline style map. */
export function getMap(): ReadonlyMap<string, string> | undefined {
    return map;
}

/** Sets the inline style map. */
export function setMap(newMap: ReadonlyMap<string, string>): void {
    if (map) throw new Error('Inline style map already set, cannot set it again.');
    map = newMap;
}
