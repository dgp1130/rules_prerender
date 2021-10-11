import { ListItemSsrComponent } from 'rules_prerender/examples/ssr/list_component/list_item_ssr';
import { ExpressComponent, ExpressContext, registerExpressComponent, Slotted } from 'rules_prerender/packages/express/express';

interface PrerenderData {
    listHeader: string;
    listItems: Slotted<ListItemSsrComponent>[];
    listFooter: string;
}

export class ListSsrComponent implements ExpressComponent {
    private constructor(
        private listHeader: string,
        private listItems: Slotted<ListItemSsrComponent>[],
        private listFooter: string,
    ) { }

    public readonly name = 'list';

    public static fromPrerendered({
        listHeader,
        listItems,
        listFooter,
    }: PrerenderData): ListSsrComponent {
        return new ListSsrComponent(listHeader, listItems, listFooter);
    }

    public *render(ctx: ExpressContext): Generator<string, void, void> {
        yield this.listHeader;
        const items = this.listItems.map((item) => item.render(ctx));
        for (const item of items) {
            yield* item;
        }
        yield this.listFooter;
    }
}

registerExpressComponent('list', ListSsrComponent.fromPrerendered);

declare global {
    interface SsrComponentMap {
        'list': [ PrerenderData, ListSsrComponent ];
    }
}
