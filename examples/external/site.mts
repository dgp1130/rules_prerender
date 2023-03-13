import { PrerenderResource, unsafeTreatStringAsSafeHtml } from 'rules_prerender';
import { renderComponent } from './component/component.mjs';

export default function*(): Generator<PrerenderResource, void, void> {
    // TODO: Migrate to Preact once we figure out how to handle
    // `@rules_prerender/preact`'s peer dep in an external repository with
    // manual `npm_link_package()` dependencies.
    yield PrerenderResource.fromHtml(
        '/index.html',
        unsafeTreatStringAsSafeHtml(`
<!DOCTYPE html>
<html>
    <head>
        <title>Test</title>
        <meta charset="utf8">
    </head>
    <body>
        <h2>Hello, World!</h2>

        ${renderComponent()}
    </body>
</html>
        `.trim()),
    );
}
