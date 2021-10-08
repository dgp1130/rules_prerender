import { SsrComponent, registerComponent } from 'rules_prerender/packages/ssr/ssr';

class StreamingSsrComponent implements SsrComponent {
    public async *render(): AsyncGenerator<string, void, void> {
        for (let i = 0; i < 10; ++i) {
            await timeout(50); // Simulate a slow action.
            yield `<li>Streaming ${i}</li>`;
        }
    }
}

registerComponent('streaming', () => new StreamingSsrComponent());

function timeout(millis: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), millis);
    });
}
