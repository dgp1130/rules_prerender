import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';
import { Component } from './component/component.js';
import { Transitive } from './transitive/transitive.js';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', renderToHtml(
        <html>
            <head>
                <title>Resources</title>
            </head>
            <body>
                <h2>Resources</h2>

                <div>
                    <span>Hello from the page!</span>
                    <img src="/favicon.ico" />
                </div>

                <Component />

                {/* Directly call transitive from the page component to cause a
                "triangle" dependency graph, where a `web_resources()` target
                is included twice, from two different paths. This serves as a
                test for this edge case which should build and work. */}
                <Transitive label='page' />
            </body>
        </html>
    ));
}
