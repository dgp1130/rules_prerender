const { PrerenderResource } = require('rules_prerender');
const { renderComponent } = require('rules_prerender/examples/javascript/component/component');

/* Renders the page. */
module.exports = function*() {
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
