import { PrerenderResource } from 'rules_prerender';
import { renderCounter } from './counter_prerender';

/** Generates prerendered test cases of the counter. */
export default function* (): Generator<PrerenderResource, void, void> {
    // Prerendered counter with an initial value of zero.
    yield PrerenderResource.of('/zero.html', `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Zero</title>
            </head>
            <body>
                ${renderCounter(0 /* initial value */)}
            </body>
        </html>
    `);

    // Prerendered counter with a positive initial value (4).
    yield PrerenderResource.of('/positive.html', `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Positive</title>
            </head>
            <body>
                ${renderCounter(4 /* initial value */)}
            </body>
        </html>
    `);

    // Prerendered counter with a negative initial value (-7).
    yield PrerenderResource.of('/negative.html', `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Negative</title>
            </head>
            <body>
                ${renderCounter(-7 /* initial value */)}
            </body>
        </html>
    `);
}
