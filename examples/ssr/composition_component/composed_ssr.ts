import { ExpressComponent, registerExpressComponent, ExpressContext } from 'rules_prerender/packages/express/express';

export class ComposedSsrComponent implements ExpressComponent {
    // TODO: Handle unused context.
    public render(ctx: ExpressContext, name: string): string {
        return `<li>SSR: Composed from ${name}</li>`;
    }
}

registerExpressComponent('composed', () => new ComposedSsrComponent());
