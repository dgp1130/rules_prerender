import { registerComponent } from 'rules_prerender/packages/ssr/ssr';

registerComponent('foo', (data) => {
    const { name } = data as { name: string };
    return {
        render() {
            return `<li>Foo component says "Hello, ${name}!"</li>`;
        }
    };
});

registerComponent('bar', (data) => ({
    async render() {
        await timeout(3_000); // Simulate a very slow component.

        return '<li>Rendered bar</li>';
    }
}));

function timeout(millis: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), millis);
    });
}
