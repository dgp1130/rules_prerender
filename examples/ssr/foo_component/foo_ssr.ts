import { JsonObject } from 'rules_prerender/common/models/json';
import { SsrComponent, registerComponent } from 'rules_prerender/packages/ssr/ssr';

interface PrerenderData extends JsonObject {
    name: string;
}

class FooSsrComponent implements SsrComponent {
    private constructor(private name: string) { }

    public static fromPrerendered({ name }: PrerenderData): FooSsrComponent {
        return new FooSsrComponent(name);
    }

    public static fromSsr(name: string): FooSsrComponent {
        return new FooSsrComponent(name);
    }

    public render(): string {
        return `<li>Foo component says hello via SSR to ${this.name}</li>`;
    }
}

registerComponent('foo', FooSsrComponent.fromPrerendered);

declare global {
    interface SsrComponentMap {
        'foo': [ PrerenderData, FooSsrComponent ];
    }
}

export {}; // DEBUG
