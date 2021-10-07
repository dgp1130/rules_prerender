import { registerComponent } from 'rules_prerender/packages/ssr/ssr';

registerComponent('foo', (data) => {
    const { name } = data as { name: string };
    return {
        render(): string {
            return `<li>Foo component says "Hello, ${name}!"</li>`;
        }
    };
});

registerComponent('bar', (data) => ({
    async *render(): AsyncGenerator<string, void, void> {
        for (let i = 0; i < 5; ++i) {
            await timeout(50); // Simulate a slow action.
            yield `<li>Rendered bar ${i}</li>`;
        }
    }
}));

function timeout(millis: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), millis);
    });
}
