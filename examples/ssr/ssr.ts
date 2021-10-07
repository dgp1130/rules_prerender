import { registerComponent } from 'rules_prerender/packages/ssr/ssr';

registerComponent('foo', (data) => ({
    render() {
        return '<li>Rendered foo</li>';
    }
}));

registerComponent('bar', (data) => ({
    render() {
        return '<li>Rendered bar</li>';
    }
}));
