/** @fileoverview Re-exports public symbols. */

import { checkForDuplicateExecution } from './duplicate_execution_check.mjs';

export {
    includeScript,
    includeScriptAnnotation as internalIncludeScriptAnnotation,
} from './scripts.mjs';
export {
    inlineStyle,
    inlineStyleAnnotation as internalInlineStyleAnnotation,
    InlineStyleNotFoundError as InternalInlineStyleNotFoundError,
} from './styles.mjs';

export {
    setMap as internalSetInlineStyleMap,
    resetMapForTesting as internalResetInlineStyleMapForTesting,
} from './inline_style_map.mjs';
export {
    execrootRelative as internalExecrootRelative,
    parseExecrootRelativePath as internalSplitExecrootRelativePath,
} from './paths.mjs';

export {
    type FileSystem as InternalFileSystem,
    diskFs as internalDiskFs,
} from '../../common/file_system.mjs';
export { PrerenderResource } from '../../common/models/prerender_resource.mjs';
export { type SafeHtml, isSafeHtml, safe } from '../../common/safe_html/safe_html.mjs';
export { unsafeTreatStringAsSafeHtml } from '../../common/safe_html/unsafe_html.mjs';

// Ensure `rules_prerender` was not duplicated in two places.
checkForDuplicateExecution();
