/** @fileoverview Re-exports public symbols. */

import { getMap as getInlineStyleMap, setMap as setInlineStyleMap } from './inline_style_map';
import { inlineStyle, InlineStyleNotFoundError } from './styles';

export { PrerenderResource } from './prerender_resource';
export { includeScript } from './scripts';
export { inlineStyle };

/** TODO */
export const context = {
    inlineStyle,
    getInlineStyleMap,
    setInlineStyleMap,
    InlineStyleNotFoundError,
};
export type Context = typeof context;
