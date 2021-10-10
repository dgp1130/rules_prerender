import { SsrComponent, registerComponent } from 'rules_prerender/packages/ssr/ssr';

class BarSsrComponent implements SsrComponent {
    public readonly name = 'bar';

    public render(): string {
        return `<li>Bar SSR</li>`;
    }
}

registerComponent('bar', () => new BarSsrComponent());

declare global {
    interface SsrComponentMap {
        'bar': [ undefined, BarSsrComponent ];
    }
}
