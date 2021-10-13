import { ExpressComponent, ExpressContext, registerExpressComponent } from 'rules_prerender/packages/express/express';

export class MixedSsrComponent implements ExpressComponent {
    public readonly name = 'mixed';

    public render(ctx: ExpressContext): string {
        return `<li>SSR: Mixed</li>`;
    }
}

registerExpressComponent('mixed', () => new MixedSsrComponent());

declare global {
    interface SsrComponentMap {
        'mixed': [ undefined, MixedSsrComponent ];
    }
}
