import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';
import { NavPane } from './nav_pane.js';

/** Generates prerendered test cases of the navigation pane. */
export default function* (): Generator<PrerenderResource, void, void> {
    // Navigation pane with flat hierarchy.
    yield PrerenderResource.fromHtml('/flat.html', renderToHtml(
        <html>
            <head>
                <title>Flat</title>
            </head>
            <body>
                <NavPane routes={[
                    { label: 'First', content: '/first/' },
                    { label: 'Second', content: '/second/' },
                    { label: 'Third', content: '/third/' },
                ]} />
            </body>
        </html>
    ));

    // Navigation pane with a nested hierarchy.
    yield PrerenderResource.fromHtml('/nested.html', renderToHtml(
        <html>
            <head>
                <title>Nested</title>
            </head>
            <body>
                <NavPane routes={[
                    {
                        label: 'Root',
                        content: [
                            { label: 'First', content: '/first/' },
                            { label: 'Second', content: '/second/' },
                            { label: 'Third', content: '/third/' },
                        ],
                    },
                ]} />
            </body>
        </html>
    ));
}
