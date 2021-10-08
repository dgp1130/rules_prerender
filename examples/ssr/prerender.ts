import { prerenderComponent } from 'rules_prerender/examples/ssr/foo_component/foo_prerender';
import { PrerenderResource, ssr } from 'rules_prerender';

export default function* (): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>Test</title>
    </head>
    <body>
        <ul>
            <li>First chunk</li>
            ${prerenderComponent('World')}
            <li>Second chunk</li>
            ${ssr('bar')}
            ${ssr('foo', { name: 'Another World' })}
            <li>Third chunk</li>
        </ul>
    </body>
</html>
    `.trim());
}
