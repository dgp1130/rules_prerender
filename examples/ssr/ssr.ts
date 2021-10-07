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
    render() {
        return '<li>Rendered bar</li>';
    }
}));
