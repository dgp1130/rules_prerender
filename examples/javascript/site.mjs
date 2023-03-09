import { PrerenderResource } from 'rules_prerender';
import { renderComponent } from './component/component.mjs';

/* Renders the page. */
export default function* () {
    yield PrerenderResource.of('/index.html', `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf8">
        <title>JavaScript</title>
    </head>
    <body>
        <h2>JavaScript</h2>
        ${renderComponent()}
    </body>
</html>
    `.trim());
}
