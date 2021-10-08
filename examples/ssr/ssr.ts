import { JsonObject } from 'rules_prerender/common/models/json';
import { SsrComponent, registerComponent } from 'rules_prerender/packages/ssr/ssr';

interface FooPrerenderedData extends JsonObject {
    name: string;
}

class FooComponent implements SsrComponent {
    private constructor(private name: string) { }

    public static fromPrerendered({ name }: FooPrerenderedData): FooComponent {
        return new FooComponent(name);
    }

    public static fromSsr(name: string): FooComponent {
        return new FooComponent(name);
    }

    public render(): string {
        return `<li>Foo component says "Hello, ${this.name}!"</li>`;
    }
}

registerComponent<FooPrerenderedData>(
    'foo', (data) => FooComponent.fromPrerendered(data));

class BarComponent implements SsrComponent {
    public async *render(): AsyncGenerator<string, void, void> {
        yield FooComponent.fromSsr('bar').render(); // Call another component.

        for (let i = 0; i < 5; ++i) {
            await timeout(50); // Simulate a slow action.
            yield `<li>Rendered bar ${i}</li>`;
        }
    }
}

registerComponent('bar', (data) => new BarComponent());

function timeout(millis: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), millis);
    });
}
