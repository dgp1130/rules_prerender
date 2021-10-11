import { Slottable, slottable, ssr } from 'rules_prerender';
import type { ListItemSsrComponent } from 'rules_prerender/examples/ssr/list_component/list_item_ssr';

export function prerenderListItem(text: string):
        Slottable<ListItemSsrComponent> {
    return slottable('list-item', ssr('list-item', { text }));
}
