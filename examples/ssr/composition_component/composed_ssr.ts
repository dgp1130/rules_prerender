import { ExpressComponent, registerExpressComponent } from 'rules_prerender/packages/express/express';

export class ComposedSsrComponent implements ExpressComponent {
    public render(): string {
        return `<li>SSR: Composed</li>`;
    }
}

registerExpressComponent('composed', () => new ComposedSsrComponent());
