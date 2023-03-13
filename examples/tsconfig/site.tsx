import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';

/**
 * Renders HTML page.
 * 
 * @param foo An implicit any type which is only allowed because of the unique
 *     tsconfig file used to compile this file.
 */
export default function*(foo): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', renderToHtml(
        <html>
            <head>
                <title>tsconfig</title>
                <meta charSet='utf8' />
            </head>
            <body>
                <h2>tsconfig</h2>
                <span>{foo}</span>
            </body>
        </html>
    ));
}
