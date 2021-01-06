import { baseLayout } from 'rules_prerender/examples/site/components/base/base';
import { repo, srcLink } from 'rules_prerender/examples/site/common/links';

/** Renders the entire home page. */
export default function (): string {
    return baseLayout('Home', () => `
        <div comp-home>
            <article>
                <p>This is the home page of a really cool site built with
                <a href="${repo}" rel="noopener" target="_blank"><code>rules_prerender</code></a>.
                It's an ugly site, but it shows how a non-trivial site can be
                built with <code>rules_prerender</code>.</p>

                <p>This site leverages components to isolate and reuse distinct
                pieces of logic. There's a component for the
                <a href="${srcLink('/examples/site/components/header/')}" rel="noopener" target="_blank">blue header above</a>,
                another component for the
                <a href="${srcLink('/examples/site/components/footer/')}" rel="noopener" target="_blank">blue footer below</a>,
                and even another component
                <a href="${srcLink('/examples/site/components/base/')}" rel="noopener" target="_blank">encapsulating all the boilerplate <code>&lt;html /&gt;</code> nonsense</a>
                that can be reused across pages for a consistent look and feel.
                Only this main content changes between them after all!</p>

                <p>Each component contains all the resources needed for it to
                render. Every one can include:</p>

                <ul>
                    <li>A library for prerendering HTML.</li>
                    <li>Some client-side JavaScript to run on the page.</li>
                    <li>Some CSS styling for the component.</li>
                    <li>Other resources at specific paths (images, fonts, static
                    JSON, etc).</li>
                </ul>

                <p>This allows each component to be completely encapsulated and
                not rely on an all-knowing page to link together all the
                required resources. Simply adding a <code>dep</code> on a
                component and calling a function from its prerender library is
                all that's needed to load that component confidently. All
                JavaScript and CSS resources are automatically bundled and
                included in the page. Other static resources are propagated
                through the dependency graph at directly specified URLs, so the
                developer knows exactly where all their resources are at
                runtime, regardless of how the source code is organized.</p>

                <p>Since everything is generated via TypeScript code, you can
                make your components as simple or as complex as you want. They
                can just return some simple strings, or use other libraries and
                modules that do cool things in Node! As one example, all those
                links above come from a
                <a href="${srcLink('/examples/site/common/links.ts')}" rel="noopener" target="_blank"><code>links.ts</code></a>
                module which nicely abstracts away all the awkwardness that is
                GitHub URLs.</p>

                <p>All of this is pre-compiled at build time, you can View
                Source on this document and see everything is prerendered, no
                JavaScript needed! The devserver also works with iBazel and will
                auto-update as you change any resources (HTML, JS, CSS, JSON,
                WOFF, WTF, ...), only a simple refresh is required.</p>

                <p>Check out some other pages to see more of the cool features
                of <code>rules_prerender</code>!</p>
            </article>
        </div>
    `);
}
