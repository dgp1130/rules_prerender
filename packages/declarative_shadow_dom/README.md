# `@rules_prerender/declarative_shadow_dom`

A `@rules_prerender` component for working with
[declarative shadow DOM](https://web.dev/declarative-shadow-dom/).

NOTE: This project is currently **experimental**. Feel free to install it to try
it out, give feedback, and suggest improvements! Just don't use it in production
quite yet.

## Installation

See [`@rules_prerender` installation instructions](https://github.com/dgp1130/rules_prerender#installation).

Once `@rules_prerender` is set up, install
`@rules_prerender/declarative_shadow_dom`.

```bash
pnpm install @rules_prerender/declarative_shadow_dom --save-dev
```

Then make it available as a `prerender_component()` by linking the package in
the base `BUILD.bazel` file. Right next to your `npm_link_packages()` target,
add:

```python
load("@rules_prerender//:index.bzl", "link_prerender_component")

link_prerender_component(
    name = "prerender_components/@rules_prerender/declarative_shadow_dom",
    package = ":node_modules/@rules_prerender/declarative_shadow_dom",
    visibility = ["//visibility:public"],
)
```

You can then depend on the package by using
`//:prerender_components/@rules_prerender/declarative_shadow_dom` wherever you
can normally depend on a `prerender_component()`.

## Usage

For example, consider this component:

```python
# my_component/BUILD.bazel

load("@rules_prerender//:index.bzl", "css_library", "prerender_component")

prerender_component(
    name = "my_component",
    srcs = ["my_component.ts"],
    styles = [":styles"],
    # It's a `prerender_component()`, so we depend on it in `deps`, not `lib_deps`.
    deps = ["//:prerender_components/@rules_prerender/declarative_shadow_dom"],
)

css_library(
    name = "styles",
    srcs = ["my_style.css"],
)
```

```typescript
// my_component/my_component.ts

import { polyfillDeclarativeShadowDom } from '@rules_prerender/declarative_shadow_dom';
import { inlineStyle } from 'rules_prerender';

export function renderMyComponent(): string {
    return `
<!-- Always include a host element, don't make the template the first node. -->
<div>
    <template shadowroot="open">
        <span>Shadow DOM content goes inside the template.</span>

        <!-- Inline styles inside the template. -->
        ${inlineStyle('./my_style.css', import.meta)}
    </template>

    <span>Light DOM content goes outside the template.</span>
</div>
    `.trim();
}
```

```css
/* my_component/my_style.css */

/* Only applies to the shadow DOM `span`, not the light DOM `span`. */
span {
    color: red;
}
```

Currently the only functionality this component exposes is
`polyfillDeclarativeShadowDom()`. It is recommended to always include this in
any component which uses declarative shadow DOM. Like all client-side scripts
in `@rules_prerender`, this polyfill will be de-duplicated if multiple
components include it.
