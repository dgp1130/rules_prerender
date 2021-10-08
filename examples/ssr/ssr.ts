import { JsonObject } from 'rules_prerender/common/models/json';
import { SsrComponent, registerComponent } from 'rules_prerender/packages/ssr/ssr';

class BarComponent implements SsrComponent {
    public async *render(): AsyncGenerator<string, void, void> {
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
