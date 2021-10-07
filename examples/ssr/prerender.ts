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
            ${ssr('foo', { name: 'World' })}
            <li>Second chunk</li>
            ${ssr('foo', { name: 'Another World' })}
            <li>Third chunk</li>
            ${ssr('bar', {})}
        </ul>
    </body>
</html>
    `.trim());
}
