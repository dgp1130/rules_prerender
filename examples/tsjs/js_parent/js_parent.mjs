import { renderTsChild } from '../ts_child/ts_child.mjs';

export function renderJsParent() {
    return `
<div class="js-parent">
    <span>JS parent</span>
    ${renderTsChild()}
</div>
    `.trim();
}
