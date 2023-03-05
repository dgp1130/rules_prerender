import { PrerenderResource, includeScript } from 'rules_prerender';
import { renderJsParent } from './js_parent/js_parent.mjs';
import { renderTsParent } from './ts_parent/ts_parent.mjs';

export default function*(): Generator<PrerenderResource, void, void> {
    // Index page to list the various test cases.
    yield PrerenderResource.of('/index.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>TS/JS</title>
        <meta charset="utf8">
    </head>
    <body>
        <ul>
            <li><a href="/js-depends-on-ts.html">JS depends on TS</a></li>
            <li><a href="/ts-depends-on-js.html">TS depends on JS</a></li>
            <li><a href="/ts-script-depends-on-js-script.html">
                TS script depends on JS script
            </a></li>
            <li><a href="/js-script-depends-on-ts-script.html">
                JS script depends on TS script
            </a></li>
        </ul>
    </body>
</html>
    `.trim());

    // Test case for JS depending on TS.
    yield PrerenderResource.of('/js-depends-on-ts.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>JS depends on TS</title>
        <meta charset="utf8">
    </head>
    <body>
        ${renderJsParent()}
    </body>
</html>
    `.trim());

    // Test case for TS depending on JS.
    yield PrerenderResource.of('/ts-depends-on-js.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>TS depends on JS</title>
        <meta charset="utf8">
    </head>
    <body>
        ${renderTsParent()}
    </body>
</html>
    `.trim());

    // Test case for client-side TS depending on JS.
    yield PrerenderResource.of('/ts-script-depends-on-js-script.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>TS script depends on JS script</title>
        <meta charset="utf8">
    </head>
    <body>
        <div id="replace-ts-parent-script">
            Text to be replaced by client-side JS.
        <div>

        ${includeScript('examples/tsjs/ts_parent_script.mjs')}
    </body>
</html>
    `.trim());

    // Test case for client-side JS depending on TS.
    yield PrerenderResource.of('/js-script-depends-on-ts-script.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>JS script depends on TS script</title>
        <meta charset="utf8">
    </head>
    <body>
        <div id="replace-js-parent-script">
            Text to be replaced by client-side JS.
        <div>

        ${includeScript('examples/tsjs/js_parent_script.mjs')}
    </body>
</html>
    `.trim());
}
