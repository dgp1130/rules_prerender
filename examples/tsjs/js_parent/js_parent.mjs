import { h } from 'preact';
import { TsChild } from '../ts_child/ts_child.js';

export function JsParent() {
    return h('div', { className: 'js-parent' }, [
        h('span', {}, [ 'JS parent' ]),
        TsChild(),
    ]);
}
