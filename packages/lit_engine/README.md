# `@rules_prerender/lit_engine`

A templating engine for `rules_prerender` based on [Lit](https://lit.dev/).

## Usage

```python
# BUILD.bazel

load("@rules_prerender//:index.bzl", "prerender_pages")

prerender_pages(
    name = "site",
    src = "site.mts",
    # Depend on `@rules_prerender/lit_engine` in `lib_deps`.
    lib_deps = [
        "//:node_modules/@rules_prerender/lit_engine",
    ],
)
```

```typescript
// site.mts

import { TemplateResult, html, renderToHtml } from '@rules_prerender/lit_engine';
import { PrerenderResource } from 'rules_prerender';

// Component functions should return the `TemplateResult` type from the `html`
// tagged template literal.
function renderComponent(): TemplateResult {
    return html`
        <my-component>Hello from my component!</my-component>
    `;
}

// Use `await renderToHtml()` to convert a `TemplateResult` into a `SafeHtml`
// type just before creating a `PrerenderResource`.
export default async function*(): AsyncGenerator<PrerenderResource, void, void> {
    yield PrerenderResource.of('/index.html', await renderToHtml(html`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Hello, World!</title>
                <meta charset="utf8">
            </head>
            <body>
                <h2>Hello, World!</h2>
                ${renderComponent()}
            </body>
        </html>
    `));
}
```
