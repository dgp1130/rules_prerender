import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';
import { Counter } from './counter_prerender.js';

/** Generates prerendered test cases of the counter. */
export default function* (): Generator<PrerenderResource, void, void> {
    // Prerendered counter with an initial value of zero.
    yield PrerenderResource.of('/zero.html', renderToHtml(
        <html>
            <head>
                <title>Zero</title>
            </head>
            <body>
                <Counter initialValue={0} />
            </body>
        </html>
    ));

    // Prerendered counter with a positive initial value (4).
    yield PrerenderResource.of('/positive.html', renderToHtml(
        <html>
            <head>
                <title>Positive</title>
            </head>
            <body>
                <Counter initialValue={4} />
            </body>
        </html>
    ));

    // Prerendered counter with a negative initial value (-7).
    yield PrerenderResource.of('/negative.html', renderToHtml(
        <html>
            <head>
                <title>Negative</title>
            </head>
            <body>
                <Counter initialValue={-7} />
            </body>
        </html>
    ));
}
