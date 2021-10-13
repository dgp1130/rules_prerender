import { JsonObject } from 'rules_prerender/common/models/json';
import { SsrComponent, registerComponent } from 'rules_prerender/packages/ssr/ssr';

interface PrerenderData extends JsonObject {
    name: string;
}

class FooSsrComponent implements SsrComponent {
    private constructor(private inputName: string) { }

    public readonly name = 'foo';

    public static fromPrerendered({ name }: PrerenderData): FooSsrComponent {
        return new FooSsrComponent(name);
    }

    public render(): string {
        return `<li>Foo component says hello via SSR to ${this.inputName}</li>`;
    }
}

registerComponent('foo', FooSsrComponent.fromPrerendered);

declare global {
    interface SsrComponentMap {
        'foo': [ PrerenderData, FooSsrComponent ];
    }
}
