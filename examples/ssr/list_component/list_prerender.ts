import { Slottable, slottable, ssr } from 'rules_prerender';
import { prerenderListItem } from 'rules_prerender/examples/ssr/list_component/list_item_prerender';
import type { ListSsrComponent } from 'rules_prerender/examples/ssr/list_component/list_ssr';

export function prerenderList(): Slottable<ListSsrComponent> {
    return slottable('list', `
<ul>
    <li>List header</li>
    ${ssr('list', {
        listHeader: '<ul><li>List item header</li>',
        listItems:
            times(10, (index) => prerenderListItem(`List item: ${index}`)),
        listFooter: '<li>List item footer</li></ul>',
    })}
    <li>List footer</li>
</ul>
    `.trim());
}

function times<T>(iterations: number, cb: (index: number) => T): T[] {
    const values = [] as T[];
    for (let i = 0; i < iterations; ++i) {
        values.push(cb(i));
    }
    return values;
}
