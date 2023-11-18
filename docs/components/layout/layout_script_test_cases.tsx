import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';
import { mockRoute } from '../../routing_mock.mjs';
import { Layout } from './layout.js';

const routes = [
    mockRoute({ label: 'First' }),
    mockRoute({ label: 'Second' }),
    mockRoute({ label: 'Third' }),
];
const currentRoute = routes[0]!;

export default function*(): Generator<PrerenderResource, void, void> {
    {
        yield PrerenderResource.fromHtml('/basic.html', renderToHtml(
            <html>
                <head>
                    <title>Basic</title>
                </head>
                <body>
                    <Layout
                        pageTitle="Basic"
                        currentRoute={currentRoute}
                        routes={routes}
                        defer-hydration
                    >
                        <div>Hello, World!</div>
                    </Layout>
                </body>
            </html>
        ));
    }
}
