import { ExpressComponent, ExpressContext, registerExpressComponent } from 'rules_prerender/packages/express/express';

interface PrerenderData {
    text: string;
}

export class ListItemSsrComponent implements ExpressComponent {
    private constructor(private readonly text: string) { }

    public static fromPrerenderData({ text }: PrerenderData):
            ListItemSsrComponent {
        return new ListItemSsrComponent(text);
    }

    public readonly name = 'list-item';

    public render(ctx: ExpressContext): string {
        return `<li>SSR: ${this.text}</li>`;
    }
}

registerExpressComponent('list-item', ListItemSsrComponent.fromPrerenderData);

declare global {
    interface SsrComponentMap {
        'list-item': [ PrerenderData, ListItemSsrComponent ];
    }
}
