import { h } from 'preact';

export function JsChild() {
    return h('div', { className: 'js-child' }, [
        h('span', {}, [ 'JS child' ]),
    ]);
}
