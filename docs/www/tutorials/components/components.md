---
title: Writing your first `prerender_component`
---

This tutorial walks through an initial overview of `prerender_component`, what
it is, when to use it, and how to create one.

NOTE: This tutorial is a continuation of the previous
[getting started](/tutorials/getting-started/) tutorial. Consider starting your
learning journey there.

NOTE: This tutorial is a work-in-progress. It may be incomplete or assume
pre-existing knowledge of certain related topics. If you are interested in
trying out `@rules_prerender` today, consider reaching out on a
[GitHub issue or discussion](https://github.com/dgp1130/rules_prerender) for
direct assistance.

TODO: Test example.

## Prerequisites

Some basic knowledge of the following is required to understand this tutorial:

*   [HTML](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics)
*   [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
*   [JavaScript](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics)
*   [Bazel](https://bazel.build/)
*   [Preact](https://preactjs.com/)

## What is a `prerender_component`?

[`prerender_component`](#TODO-link-to-reference-docs) is a Bazel macro provided
by `@rules_prerender`. It provides an abstraction over a single piece of
self-contained user interface (UI). For example, a checkout button or a user
profile icon with login functionality could each be implemented as a
`prerender_component`. If you have used components in other frameworks or native
web components, `prerender_component` serves a similar purpose.

`prerender_component` has four "slices" of functionality:

*   Prerendered HTML - Specifies the structure of the component.
*   CSS styles - Styles the component and handles its presentation to the user.
*   Client-side JavaScript - Implements the component at runtime in the browser.
*   Static resources - Lists additional files needed at specific URLs for the
    component to function, such as an image or font.

Only the prerendered HTML is necessary to create a component, the other three
slices are optional and can be added when needed.

## When should you use a `prerender_component`?

TODO: Move to components concept page?

Components are incredibly useful abstractions in all frameworks, and
`@rules_prerender` is no exception. Components provide a single self-contained
build artifact encapsulating a piece of UI. They express dependencies across the
different slices and support concepts such as:

*   "Whenever this HTML is rendered, also include the CSS needed to
    style it."
*   "Whenever this `<button>` is rendered, also include this JavaScript
    containing its event listener."
*   "Whenever this `<img src="/checkout.png">` is displayed, also build and
    include the image it actually links at `/checkout.png`."

This ensures it is not possible to prerender some HTML content without also
including the JavaScript, CSS, and static resources necessary to run the
component in the browser.

Some use cases which should use `prerender_component`:

*   Any code rerendering HTML at build time.
*   Any styles specific to prerendered HTML.
*   Any JavaScript running in the browser which is used by prerendered HTML.
    *   For example, a button handler.
*   Any static resources used by prerendered HTML.
    *   For example, an image.

Some use cases which should consider alternative Bazel rules:

*   Any CSS code with reusable styles and no dependency on external resources
    such as fonts or images.
    *   Consider using [`css_library`](#TODO-link-to-reference-docs).
    *   Any library can be used by a `prerender_component`, even if that library
        is defined and built separately.
*   Any JavaScript code unrelated to web site presentation and not specific to a
    single component.
    *   Consider using
        [`js_library`](https://docs.aspect.build/rulesets/aspect_rules_js/docs/js_library)
        or
        [`ts_project`](https://docs.aspect.build/rulesets/aspect_rules_ts/docs/rules#ts_project).
    *   Any library can be used by a `prerender_component`, even if that library
        is defined and built separately.
*   Built files not served to the application at runtime.
    *   Consider using
        [`genrule`](https://bazel.build/reference/be/general#genrule) or a
        [custom rule](https://bazel.build/extending/rules).
    *   Any source or built files can be used by a prerender library through the
        `data` dependency and do not need to be served at runtime.

## Creating a component

Since components contain four "slices", this tutorial will walk through each one
individually to create a component which shows a card linking to a blog post.

A component should live its own exclusive directory. To begin, create a new
directory at `hello_world/blog_post_card` and add a `blog_post_card.tsx` file as
well as a `BUILD.bazel` file. In the TSX file, create a Preact component which
renders some HTML content.

```tsx
// hello_world/blog_post_card/blog_post_card.tsx

import { VNode } from 'preact';

/** Represents a blog post which can be displayed in a card. */
export interface BlogPost {
    title: string;
    summary: string;
    link: URL;
}

/** Renders a card linking to the given blog post. */
export function BlogPostCard({ post }: { post: BlogPost }): VNode {
    return <section>
        <h2><a href={post.link.toString()}>{post.title}</a></h2>
        <div>{post.summary}</div>
    </section>;
}
```

While this file does not contain raw HTML directly, you can think of it like a
library which returns or generates HTML content using Preact.

Next, configure the build with a `ts_project` and `prerender_component`.

```BUILD
# hello_world/blog_post_card/BUILD.bazel

load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@rules_prerender//:index.bzl", "prerender_component")

prerender_component(
    name = "blog_post_card",
    # Link to the build target used for prerendering HTML.
    prerender = ":prerender",
    # Make this component available anywhere in the `hello_world` site.
    visibility = ["//hello_world:__subpackages__"],
)

# Compile the component's TypeScript used for prerendering.
ts_project(
    name = "prerender",
    srcs = ["blog_post_card.tsx"],
    tsconfig = "//:tsconfig.json",
    deps = ["//:node_modules/preact"],
)
```

The `:prerender` target compiles the component's TypeScript into JavaScript,
while the `:blog_post_card` target collects the result into a
`prerender_component`. Because it is linked via the `prerender` attribute, the
component knows `blog_post_card.tsx` will _only_ be used for prerendering at
build time and will _not_ be included in the client-side JavaScript bundle.

### Prerendering a component

Use the component by updating the `hello_world/hello_world.tsx` file to import
and call the Preact component.

```diff
  // hello_world/hello_world.tsx

  import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';
  import { MyComponent } from '../my_component/my_component_prerender.js';
+ import { BlogPost, BlogPostCard } from './blog_post_card/blog_post_card.js';
+
+ const post: BlogPost = {
+     title: 'Why `@rules_prerender` is the new hotness!',
+     summary: '`@rules_prerender` is taking the web development community by storm. Could it be the revolution we\'ve been waiting for?',
+     link: new URL('https://rules-prerender.dwac.dev/'),
+ };

  // Renders HTML pages for the site at build-time.
  // If you aren't familiar with generators and the `yield` looks scary, you could
  // also write this as returning an `Array<PrerenderResource>`.
  export default function*(): Generator<PrerenderResource, void, void> {
      // Generate an HTML page at `/index.html` with this content:
      yield PrerenderResource.fromHtml('/index.html', renderToHtml(
          <html>
              <head>
                  <title>Hello, World!</title>
                  <meta charSet="utf8" />
              </head>
              <body>
                  <h1>Hello from my <code>@rules_prerender</code> site!</h1>
+                 <BlogPostCard post={post} />
              </body>
          </html>
      ));
  }
```

Make sure to update the dependencies of the `//hello_world:prerender` target to
depend on `//hello_world/blog_post_card:blog_post_card_prerender`.

```diff
  ts_project(
      name = "prerender",
      srcs = ["hello_world.tsx"],
      tsconfig = "//:tsconfig.json",
+     # Depend on the prerender "slice" of the `blog_post_card` component.
+     deps = ["//hello_world/blog_post_card:blog_post_card_prerender"],
  )
```

IMPORTANT: Those familiar with Bazel would expect to depend on
`//hello_world/blog_post_card:blog_post_card` or possibly even
`//hello_world/blog_post_card:prerender`. However `prerender_component`
generates a separate target for each slice. Code used for prerendering is
included in a `_prerender` target which gets generated by the
`prerender_component`, appending to the `name` attribute. In this case, it
generates `//hello_world/blog_post_card:blog_post_card_prerender`. You can think
of this like an [alias](https://bazel.build/reference/be/general#alias) to
`//hello_world/blog_post_card:prerender`, however you *must* use this alias when
depending on the component. Do *not* depend on
`//hello_world/blog_post_card:prerender` directly. See
[components conceptual reference](/concepts/components/) for more details.

TODO: How to explain component dependencies? Didn't expect it to become a
problem so soon.

Serve the site to see the new component rendered on the index page. Consider
looking the returned HTML to confirm that the component was rendered at build
time and neither the component nor Preact were included in the result.

```shell
bazel run //hello_world:devserver
```

TODO: Screenshot.

TIP: There are no constraints of the shape of the exported symbols in a
`prerender` `ts_project`. Preact component functions are the most common form of
a prerender library, however this particular example also includes an
`interface`. It could just as easily omit the Preact component and use a
stateful class. It does not even have to return `VDom` or anything
Preact-specific. The only unique aspect of a prerender library is that it can be
imported and executed at *build time* and is not included in the client-side
JavaScript bundle.

## Adding CSS styles

TODO

## Adding client-side JavaScript

TODO

## Adding static resources

TODO
