# `@rules_prerender/preact`

A `@rules_prerender` rendering engine for [Preact](https://preactjs.com/).

NOTE: This project is currently **experimental**. Feel free to install it to try
it out, give feedback, and suggest improvements! Just don't use it in production
quite yet.

## Installation

See [`@rules_prerender` installation instructions](https://github.com/dgp1130/rules_prerender#installation).

Once `@rules_prerender` is set up, install `@rules_prerender/preact` and
`preact`.

```bash
pnpm install preact @rules_prerender/preact --save-dev
```

Depend on this in Bazel just like any other NPM package, typically at
`//:node_modules/@rules_prerender/preact`.

If you are using TypeScript, also go through Preact's
[configuration instructions](https://preactjs.com/guide/v10/typescript/#typescript-configuration).

## Usage

```python
# my_site/BUILD.bazel

load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_to_bin")
load("@rules_prerender//:index.bzl", "prerender_pages")

copy_to_bin(
    name = "package",
    srcs = ["package.json"],
)

prerender_pages(
    name = "my_site",
    srcs = ["my_site.tsx"],
    # Need a `package.json` with `"type": "module"` to load compiled `*.tsx`
    # files at runtime. Also needs to be copied to bin.
    data = [":package"],
    lib_deps = [
        "//:node_modules/@rules_prerender/preact",
        # JSX requires a Preact dependency, even if you don't import from it.
        "//:node_modules/preact",
    ],
)
```

```tsx
import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';

export default function* (): Generator<PrerenderResource, void, void> {
    yield PrerenderResource.fromHtml('/index.html', renderToHtml(
        <html>
            <head>
                <title>My Preact Page</title>
                <meta charSet="utf8" />
            </head>
            <body>
                <h2>Hello, World!</h2>
            </body>
        </html>
    ));
}
```

Prefer `includeScript()` and `inlineStyle()` from `@rules_prerender/preact`, as
they return `VNodes`.

```tsx
import { includeScript, inlineStyle } from '@rules_prerender/preact';
import { VNode } from 'preact';

export function Component(): VNode {
    return <div>
        {includeScript('./my_script.mjs', import.meta)}
        {inlineStyle('./my_style.css', import.meta)}
    </div>;
}
```

Preact doesn't directly support `<template />` elements, so
`@rules_prerender/preact` exports a `Template` component for this purpose. This
is useful for declarative shadow DOM.

```tsx
import { Template } from '@rules_prerender/preact';
import { VNode } from 'preact';

export function Component(): VNode {
    return <div>
        <Template shadowroot="open">
            <div>Hello, World!</div>
            <slot></slot>
        </Template>
        <div>Hello, Mars!</div>
    </div>;
}
```
