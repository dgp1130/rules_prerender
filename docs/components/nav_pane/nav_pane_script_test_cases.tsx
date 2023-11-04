import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';
import { mockRoute } from '../../routing_mock.mjs';
import { enableTestIds } from '../../test_id.mjs';
import { NavPane } from './nav_pane.js';

enableTestIds();

/** Generates prerendered test cases of the navigation pane. */
export default function* (): Generator<PrerenderResource, void, void> {
    // Navigation pane with flat hierarchy.
    {
        const routes = [
            mockRoute({ label: 'First' }),
            mockRoute({ label: 'Second' }),
            mockRoute({ label: 'Third' }),
        ];
        const currentRoute = routes[0]!;

        yield PrerenderResource.fromHtml('/flat.html', renderToHtml(
            <html>
                <head>
                    <title>Flat</title>
                </head>
                <body>
                    <NavPane currentRoute={currentRoute} routes={routes} />
                </body>
            </html>
        ));
    }

    // Navigation pane with a nested hierarchy.
    {
        const routes = [
            mockRoute({
                children: [ mockRoute(), mockRoute(), mockRoute() ],
            }),
            mockRoute(),
        ];
        // Current route is the second route so the client does not
        // auto-expand the three sub-routes under the first route.
        const currentRoute = routes[1]!;

        yield PrerenderResource.fromHtml('/nested.html', renderToHtml(
            <html>
                <head>
                    <title>Nested</title>
                </head>
                <body>
                    <NavPane currentRoute={currentRoute} routes={routes} />
                </body>
            </html>
        ));
    }

    // Current route is under a subtree and should start expanded.
    {
        const routes = [
            mockRoute({
                label: 'First',
                children: [
                    mockRoute(),
                    mockRoute({
                        label: 'Current',
                    }),
                    mockRoute(),
                ],
            }),
            mockRoute({
                label: 'Second',
                children: [
                    mockRoute(),
                    mockRoute(),
                ],
            }),
        ];
        const currentRoute = routes[0]!.children![1]!;

        yield PrerenderResource.fromHtml('/current.html', renderToHtml(
            <html>
                <head>
                    <title>Current</title>
                </head>
                <body>
                    <NavPane currentRoute={currentRoute} routes={routes} />
                </body>
            </html>
        ));
    }
}
