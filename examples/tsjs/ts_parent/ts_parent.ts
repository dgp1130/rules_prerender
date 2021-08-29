import { renderJsChild } from '../js_child/js_child';

export function renderTsParent(): string {
    return `
<div class="ts-parent">
    <span>TS parent</span>
    ${renderJsChild()}
</div>
    `.trim();
}
