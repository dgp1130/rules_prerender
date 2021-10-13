import { ExpressComponent, ExpressContext, registerExpressComponent } from 'rules_prerender/packages/express/express';

let requestCount = 0;

export class MixedSsrComponent implements ExpressComponent {
    public readonly name = 'mixed';

    public render(ctx: ExpressContext): string {
        requestCount++;
        return `<li>SSR: This was request #${requestCount}.</li>`;
    }
}

registerExpressComponent('mixed', () => new MixedSsrComponent());

declare global {
    interface SsrComponentMap {
        'mixed': [ undefined, MixedSsrComponent ];
    }
}
