import { ExpressComponent, registerExpressComponent, ExpressContext } from 'rules_prerender/packages/express/express';

export class InnerSsrComponent implements ExpressComponent {
    public readonly name = 'inner';

    // TODO: Handle unused context.
    public render(ctx: ExpressContext, name: string): string {
        return `<li>SSR: Inner component called by ${name}</li>`;
    }
}

registerExpressComponent('inner', () => new InnerSsrComponent());

declare global {
    interface SsrComponentMap {
        'inner': [ undefined, InnerSsrComponent ];
    }
}
