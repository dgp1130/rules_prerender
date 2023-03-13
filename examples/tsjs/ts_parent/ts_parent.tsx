import { VNode } from 'preact';
import { JsChild } from '../js_child/js_child.mjs';

export function TsParent(): VNode {
    return <div class="ts-parent">
        <span>TS parent</span>
        <JsChild />
    </div>;
}
