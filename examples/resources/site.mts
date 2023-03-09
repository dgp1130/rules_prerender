import { PrerenderResource } from 'rules_prerender';
import { renderComponent } from './component/component.mjs';
import { renderTransitive } from './transitive/transitive.mjs';

export default function*(): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', `
        <!DOCTYPE html>
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

                ${renderComponent()}

                <!-- Directly call transitive from the page component to cause a
                "triangle" dependency graph, where a \`web_resources()\` target
                is included twice, from two different paths. This serves as a
                test for this edge case which should build and work. -->
                ${renderTransitive('page')}
            </body>
        </html>
    `);
}
