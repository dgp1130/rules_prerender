/** @fileoverview TODO */

let map: ReadonlyMap<string, string> | undefined = undefined;

/** TODO */
export function getMap(): ReadonlyMap<string, string> {
    if (!map) throw new Error(`Inline style map not set.`);
    return map;
}

/** TODO */
export function setMap(newMap: ReadonlyMap<string, string>): void {
    if (map) throw new Error(`Inline style map already set.`);
    map = newMap;
}
