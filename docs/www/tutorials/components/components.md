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

TODO: Think through the order operations for each section. Currently we're using
an API and then creating it. Might be easier to follow the other way around.
Create the stylesheet, build it, then link it into the existing component.

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

TODO: Do we need `declaration` here so it can be consumed by `hello_world.tsx`?

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

Styling a component involves a few different concepts applied together.

### 1. Author the CSS

To style a component, start by creating a new CSS file at
`hello_world/blog_post_card/blog_post_card.css` with some CSS content.

```css
/* hello_world/blog_post_card/blog_post_card.css */

h2 {
    font-weight: bold;
}
```

### 2. Add declarative shadow DOM

Next, we need to make two changes to the component. First, we'll add
[declarative shadow DOM](https://developer.chrome.com/articles/declarative-shadow-dom/)
to the root element.

```diff
+ import { Template } from '@rules_prerender/preact';

  // Interface...

  /** Renders a card linking to the given blog post. */
  export function BlogPostCard({ post }: { post: BlogPost }): VNode {
      return <section>
+         <Template shadowrootmode="open">
              <h2><a href={post.link.toString()}>{post.title}</a></h2>
              <div>{post.summary}</div>
+         </Template>
      </section>;
  }
```

This will create a
[shadow root](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
containing the component's content. This encapsulates the DOM and its styling.
It prevents external styles from leaking into the component as well as hides the
internal DOM structure from other components to prevent them from accidentally
depending on implementation details private to the component.

While shadow DOM is useful for many purposes, the main value it provides for
this tutorial is scoping any styles inside the shadow root. This is what allows
us to use broad selectors like `h2` without affecting _all_ `h2` elements on the
page.

NOTE: Seasoned declarative shadow DOM users might want to directly render
`<template shadowrootmode="open">` (lower cased). While this can work, the
[`Template`](#TODO-link-to-reference-docs) component imported from
[`@rules_prerender/preact`](#TODO-link-to-reference-docs) will automatically
polyfill declarative shadow DOM for browsers lacking support. Always use
`Template` from `@rules_prerender/preact` and never render a raw
`<template shadowrootmode="...">` tag.

### 3. Inline the style tag

Now that the component is using shadow DOM and styles are safely encapsulated,
they can inlined inside the component with
[`inlineStyle`](#TODO-link-to-reference-docs).

```diff
// hello_world/blog_post_card/blog_post_card.tsx

- import { Template } from '@rules_prerender/preact';
+ import { Template, inlineStyle } from '@rules_prerender/preact';

  // Interface...

  /** Renders a card linking to the given blog post. */
  export function BlogPostCard({ post }: { post: BlogPost }): VNode {
      return <section>
          <Template shadowrootmode="open">
+             {inlineStyle('./blog_post_card.css', import.meta)}

              <h2><a href={post.link.toString()}>{post.title}</a></h2>
              <div>{post.summary}</div>
          </Template>
      </section>;
  }
```

[`inlineStyle`](#TODO-link-to-reference-docs) will load the `blog_post_card.css`
file and render it inside an inline `<style>` tag. The path
`./blog_post_card.css` is resolved relative to the source file
(`blog_post_card.tsx`) in this case. Since `inlineStyle` is placed inside
`<Template shadowrootmode="open">`, styles will inside the shadow root and
limited to only this component.

TIP: _Always_ place component styles inside a `<Template shadowrootmode="open">`
or they will apply to the entire page!

TIP: It maybe tempting to swap the `<Template>` and `<section>` elements,
however `<Template shadowrootmode="open">` should _never_ be the root element
returned by a component. This is because shadow DOM requires a host element
which is the parent of the `<Template>` (`<section>` in this case). If the
component returned `<Template shadowrootmode="open">` directly, then the shadow
root would be applied to the parent of the `<BlogPostCard>`. `:host` styles
would apply to the _parent_ of `<BlogPostCard>` and lead to unexpected behavior.

### 4. Build the CSS

The final step is to update your `BUILD.bazel` to include the newly created CSS
and make it available to the `prerender_component` target. Use the
[`css_library`](#TODO-link-to-reference-docs) rule provided by
`@rules_prerender` to compile and organize your CSS.

```BUILD
# hello_world/blog_post_card/BUILD.bazel

load("@rules_prerender//:index.bzl", "css_library")

css_library(
    name = "styles",
    srcs = ["blog_post_card.css"],
)
```

NOTE: `css_library` is a relatively minimal wrapper which allows CSS files to
express dependencies on each other. The only unique behavior this supports is
resolution of `@import` specifiers to other source files in dependencies which
are bundled together at build time.

TODO: Guide about CSS styling more explicitly. Explaining dependencies,
`@import`, global CSS, whether or not to use classes, etc.

Then, you can link this library to your existing `prerender_component` with the
`styles` attribute. You will also need to add
`//:node_modules/@rules_prerender/preact` as a dependency to the existing
`:prerender` target so `Template` and `inlineStyle` are accessible.

```diff
  # hello_world/blog_post_card/BUILD.bazel

  prerender_component(
      name = "blog_post_card",
      # Link to the build target used for prerendering HTML.
      prerender = ":prerender",
+     # Link to the build target containing component CSS.
+     styles = ":styles",
      # Make this component available anywhere in the `hello_world` site.
      visibility = ["//hello_world:__subpackages__"],
  )

  # Compile the component's TypeScript used for prerendering.
  ts_project(
      name = "prerender",
      srcs = ["blog_post_card.tsx"],
      tsconfig = "//:tsconfig.json",
      deps = [
+         "//:node_modules/@rules_prerender/preact",
          "//:node_modules/preact",
      ],
  )
```

Test out the site again with:

```shell
bazel run //hello_world:devserver
```

TODO: Screenshot.

The title of the blog post should now be bolded. You can also consider adding a
new `<h2>` tag _outside_ the component's shadow root to confirm that it is not
affected by the CSS.

## Adding client-side JavaScript

All the JavaScript / TypeScript code in the `:prerender` library is only ever
available or executed at _build time_. No JavaScript is shipped to the client by
default. However, sometimes JavaScript is necessary to progressively enhance the
base experience. This is achieved with a mechanism very similar to CSS.

NOTE: This tutorial continues to use TypeScript when authoring source files,
however the built and compiled output is JavaScript. Since certain parts of the
toolchain apply to the post-transpilation code, the terms "JavaScript" and
"TypeScript" are fairly interchangeable in this section

### 1. Author the client-side TypeScript

To start, create a script which logs to the browser console. Use the suffix
`_script` to differentiate this file from the existing `blog_post_card.tsx`
file.

```typescript
// hello_world/blog_post_card/blog_post_card_script.mts

console.log('Hello, World!');
```

TODO: Explain file extension discrepancy.

### 2. Include the script

Next, add the script to the client bundle by including it in the rendered
output with [`includeScript`](#TODO-link-to-reference-docs).

```diff
  // hello_world/blog_post_card/blog_post_card.tsx

- import { Template, inlineStyle } from '@rules_prerender/preact';
+ import { Template, includeScript, inlineStyle } from '@rules_prerender/preact';

  // Interface...

  /** Renders a card linking to the given blog post. */
  export function BlogPostCard({ post }: { post: BlogPost }): VNode {
      return <section>
          <Template shadowrootmode="open">
              {inlineStyle('./blog_post_card.css', import.meta)}
+             {includeScript('./blog_post_card_script.mjs', import.meta)}

              <h2><a href={post.link.toString()}>{post.title}</a></h2>
              <div>{post.summary}</div>
          </Template>
      </section>;
  }
```

[`includeScript`](#TODO-link-to-reference-docs), much like
[`inlineStyle`](#TODO-link-to-reference-docs), will load the
`blog_post_card_script.mjs` file, bundle it together with any other JavaScript
on the page, and inject a `<script>` tag to execute the JavaScript.

Unlike [component CSS](#adding-css-styles), declarative shadow DOM is not
required to effectively use client-side JavaScript in a component.

NOTE: This tutorial uses TypeScript, so the authored source file uses a `.mts`
extension. However `includeScript` _always_ accepts a JavaScript file extension
(`.mjs`) instead of a TypeScript extension. This is because script bundling
occurs after any TypeScript compilation where only JavaScript files are
available regardless of the source language.

### 3. Build the TypeScript

Create a new `ts_project` target to compile client-side scripts for the
component.

```BUILD
# hello_world/blog_post_card/BUILD.bazel

load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

ts_project(
    name = "scripts",
    srcs = ["blog_post_card_script.mts"],
    tsconfig = "//:tsconfig.json",
)
```

NOTE: There is an existing `ts_project` target in `:prerender`, however projects
should _not_ share a target for prerendering and client-side JavaScript. Doing
so presents an opportunity to accidentally execute client-side JavaScript at
build time in Node as well as including prerendering logic in the client-side
bundle. Also the two targets may choose to use different `tsconfig.json` files
with distinct settings given their different use cases.

Finally, add the new `:scripts` target to the existing `prerender_component`
target via the `scripts` attribute.

```diff
  # hello_world/blog_post_card/BUILD.bazel

  prerender_component(
      name = "blog_post_card",
      # Link to the build target used for prerendering HTML.
      prerender = ":prerender",
      # Link to the build target containing component CSS.
      styles = ":styles",
+     # Link to the build target containing client-side JavaScript.
+     scripts = ":scripts",
      # Make this component available anywhere in the `hello_world` site.
      visibility = ["//hello_world:__subpackages__"],
  )
```

Rebuild the application and check to browser console to see a friendly message
displayed.

### Using JavaScript effectively

There are a few things to keep in mind with how client-side JavaScript works in
`@rules_prerender`.

First, even if a script is included multiple times via `includeScript`, it will
only ever be executed once on the page. In the above example, "Hello, World!"
will only ever log once, no matter how many `<BlogPostCard />` components are
rendered on the page.

Second, there are no restrictions on client-side JavaScript. It can be as
minimal or complex as necessary for the problem at hand. In this example, only
a log statement is included, however this script could add an event listener,
define a custom element, or bootstrap an entire client-side rendered web
framework.

Third, because scripts are only loaded once, but a component may be rendered
multiple times it can be tricky to find all the DOM which needs to be controlled
by an associated script. One approach to doing this is to render a
[custom element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements).

```diff
  // hello_world/blog_post_card/blog_post_card.tsx

- import { Template, includeScript, inlineStyle } from '@rules_prerender/preact';
+ import { CustomElement, Template, includeScript, inlineStyle } from '@rules_prerender/preact';

  // Interface...

  /** Renders a card linking to the given blog post. */
  export function BlogPostCard({ post }: { post: BlogPost }): VNode {
-     return <section>
+     return <my-blog-post-card>
          <Template shadowrootmode="open">
              {inlineStyle('./blog_post_card.css', import.meta)}
              {includeScript('./blog_post_card_script.mjs', import.meta)}

              <h2><a href={post.link.toString()}>{post.title}</a></h2>
              <div>{post.summary}</div>
          </Template>
+     </my-blog-post-card>;
-     </section>;
  }

+ // Declare to Preact types that `<my-blog-post-card>` is a custom element.
+ declare module 'preact' {
+     namespace JSX {
+         interface IntrinsicElements {
+             'my-blog-post-card': JSX.HTMLAttributes<CustomElement>;
+         }
+     }
+ }
```

This will render a `<my-blog-post-card>` element to the page at build time. On
its own, this is nothing special. However, we can include a custom element
definition in the client-side JavaScript.

```typescript
// hello_world/blog_post_card/blog_post_card_script.ts

class BlogPostCard extends HTMLElement {
    connectedCallback() {
        console.log('Upgraded a blog post card!');
    }
}
```

While this script is still only executed once on the page, it will upgrade and
create custom element instances for every `<my-blog-post-card>` on the page,
meaning this script will log for _every instance_ of the component. This is a
useful way of referencing all the instances of a component and progressively
enhancing their functionality.

TODO: This content is kind of involved, should it be in a different guide?

## Adding static resources

Web sites are not just HTML, JavaScript, and CSS. They also include images,
videos, fonts, and all kinds of other content accessed dynamically at runtime.
`prerender_component` supports "resources" which represent content hosted at a
particular URL which the component may require at runtime.

Resources can be thought of as static files which are served at a specific URL
path and fetched at runtime. Resource files can be checked in to source code
directly or generated at build time.

### 1. Host an image

A very common use case is hosting an image. Create a thumbnail image at
`hello_world/blog_post_card/star.png`, then include it in the build with a
[`web_resources`](#TODO-link-to-reference-docs) target.

TODO: Add an image resource for readers to download.

```BUILD
# hello_world/BUILD.bazel

load("@rules_prerender//:index.bzl", "web_resources")

web_resources(
    name = "resources",
    entries = {
        "/images/favorite.png": "star.png",
    },
)
```

This creates a `:resources` target which holds the `star.png` image at the path
`/images/favorite.png` in the built output. The left side of `entries` is the
absolute path the file should be hosted at, starting with a slash. The right
side is the source file or Bazel target to use at this path. Note that in
source, the file is named `star.png`, but the image will actually be available
at `/images/favorite.png`.

Next, link the resources into the existing `prerender_component` target.

```diff
  # hello_world/blog_post_card/BUILD.bazel

  prerender_component(
      name = "blog_post_card",
      # Link to the build target used for prerendering HTML.
      prerender = ":prerender",
      # Link to the build target containing component CSS.
      styles = ":styles",
      # Link to the build target containing client-side JavaScript.
      scripts = ":scripts",
+     # Link to static resources included with this component.
+     resources = ":resources",
      # Make this component available anywhere in the `hello_world` site.
      visibility = ["//hello_world:__subpackages__"],
  )
```

### 2. Use the image

Finally, update the component's prerendered DOM to include an
[`<img>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img) tag
linking to the `/images/favorite.png` path the image will be served at.

```diff
  // hello_world/blog_post_card/blog_post_card.tsx

  import { Template, includeScript, inlineStyle } from '@rules_prerender/preact';

  /** Represents a blog post which can be displayed in a card. */
  export interface BlogPost {
      title: string;
      summary: string;
      link: URL;
  }

  /** Renders a card linking to the given blog post. */
  export function BlogPostCard({ post }: { post: BlogPost }): VNode {
      return <section>
          <Template shadowrootmode="open">
              {inlineStyle('./blog_post_card.css', import.meta)}
              {includeScript('./blog_post_card_script.mjs', import.meta)}

              <h2><a href={post.link.toString()}>{post.title}</a></h2>
              <div>{post.summary}</div>
+             <img src="/images/favorite.png" alt="Star icon.">
          </Template>
      </section>;
  }
```

Rerun the application to see the star appear.

```shell
bazel run //hello_world:devserver
```

### `web_resources` usage

With `web_resources`, components can include static files at known URL paths.
Resources are always included in the build whenever their associated component
is used, so a component can easily rely on static files.

Resources are not just limited to images, they can include any kind of file
content such as (but not limited to):

*   Images
*   Videos
*   Fonts
*   Raw text
*   JSON
*   Binary content

`<img>` tags are one way of consuming the content in the web site, but again,
they are not required. Since these resources are served like any other web
content they can be accessed through
[`<video>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video),
[`@font-face`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face), or
even [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
Resources are compatible with any mechanism which loads content over HTTP.

These files can also be generated at build time. `entries` accepts any Bazel
label as a dependency provided it outputs a single file. That label could be the
output of a [`genrule`](https://bazel.build/reference/be/general#genrule) or a
[custom rule](https://bazel.build/extending/rules) which generates an
arbitrarily complex file at build time.

## `prerender_component` dependencies

Going through this tutorial, you may have noticed that not only was the
`blog_post_card` component entirely self-contained, it was able to change and
evolve over time without breaking its existing contract. When client-side
JavaScript, CSS, or static resources were added, not once did `hello_world.tsx`
need to be updated to load or bundle this extra content.

`prerender_component` collects all these different "slices" of a component and
binds them together in the dependency graph. This means that when
`hello_world.tsx` imports and depends on `<BlogPostCard />`, it also implicitly
depends on `blog_post_card_script.mts`, `blog_post_card.css`, and `star.png`.
This implicit dependency management is incredibly powerful, but also comes with
some interesting trade offs to keep in mind.

`prerender_component` is unique to other Bazel macros or rules you might be
familiar with. Most common rules contain some kind of `deps` property to support
composition, such as where a `ts_project` has a `deps` dependency on another
`ts_project`. `prerender_component` does _not_ work this way and lacks any kind
of `deps` property. So how does one component depend on another?

Instead, `prerender_component` depends on each of its "slices" through the
`prerender`, `scripts`, `styles`, and `resources` attributes. It then generates
targets by appending suffixes to the component's name: `%{name}_prerender`,
`%{name}_scripts`, `%{name}_styles`, and `%{name}_resources`. These generated
targets are effectively aliases to the `prerender_component` inputs. For
example, consider the following component:

```BUILD
load("@rules_prerender//:index.bzl", "prerender_component")

prerender_component(
    name = "my_component",
    prerender = ":my_prerender",
    scripts = ":my_scripts",
    styles = ":my_styles",
    resources = ":my_resources",
)
```

This generates four new targets named `my_component_*` with aliases to each
slice which looks like:

*   `:my_component_prerender` -> `:my_prerender`
*   `:my_component_scripts` -> `:my_scripts`
*   `:my_component_styles` -> `:my_styles`
*   `:my_component_resources` -> `:my_resources`

These aliases may seem redundant, but actually add required information for
`@rules_prerender` to manage these dependencies. The extra information in the
alias is how a dependency on the prerender slice of a component knows to bundle
associated scripts, styles, and resources automatically.

To use this effectively, whenever a target wants to depend on a component slice
such as `:my_prerender`, actually depend on `:my_component_prerender` instead.
As an alias, this will function exactly the same way, but it will also include
the extra dependency information required by `@rules_prerender`.
This tutorial actually already did this when `hello_world.tsx`
[prerendered a component](#prerendering-a-component) by adding a dependency on
`:blog_post_card_prerender` which is generated by `prerender_component`.

To use a minimal example, consider this reduced `blog_post_card` component:

```BUILD
# hello_world/blog_post_card/BUILD.bazel

load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@rules_prerender//:index.bzl", "prerender_component")

# Generates `:blog_post_card_prerender` aliased to `:prerender`.
prerender_component(
    name = "blog_post_card",
    prerender = ":prerender",
    visibility = ["//hello_world:__subpackages__"],
)

# `prerender_component` depends on this, but nothing else does.
# It's even private visibility so no other targets *can* depend on it!
ts_project(
    name = "prerender",
    srcs = ["blog_post_card.tsx"],
    deps = ["//:node_modules/preact"],
)
```

```tsx
// hello_world/blog_post_card/blog_post_card.tsx

import { VNode } from 'preact';

export function BlogPostCard(): VNode {
    return <div>Check out this blog post...</div>;
}
```

Another `prerender_component` called `blog_post_list` should render a list of
these blog post cards.

```tsx
// hello_world/blog_post_list/blog_post_list.tsx

import { VNode } from 'preact';
import { BlogPostCard } from '../blog_post_card/blog_post_card.js';

export function BlogPostList(): VNode {
    return <>
        <BlogPostCard />
        <BlogPostCard />
        <BlogPostCard />
    </>;
}
```

At the Bazel layer, `blog_post_list.tsx` is included in a `ts_project` which
_looks like_ it should have a dependency on
`//hello_world/blog_post_card:prerender`. However, because of the unique rules
of `prerender_component`, it should instead depend on the generated
`//hello_world/blog_post_card:blog_post_card_prerender` like so:

```BUILD
# hello_world/blog_post_list/BUILD.bazel

load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@rules_prerender//:index.bzl", "prerender_component")

# No direct dependency on `//hello_world/blog_post_card:blog_post_card`.
prerender_component(
    name = "blog_post_list",
    prerender = ":prerender",
    visibility = ["//hello_world:__subpackages__"],
)

ts_project(
    name = "prerender",
    srcs = ["blog_post_list.tsx"],
    deps = [
        # IMPORTANT! This depends on `:blog_post_card_prerender`, *not*
        # `//hello_world/blog_post_card:prerender`.
        "//hello_world/blog_post_card:blog_post_card_prerender",
        "//:node_modules/preact",
    ],
)
```

TODO: `declaration = True`?

The general rule is that any Bazel target which is a direct dependency of
`prerender_component` should _not_ be used as a dependency of any other target.
Instead, all other dependencies should go through the alias generated by
`prerender_component`. This applies to targets used for all four slices of a
component (prerender JavaScript, client-side JavaScript, CSS styles, static
resources).

This same rule applies when using a `prerender_component` from `prerender_pages`
or `prerender_pages_unbundled`. Both of those macros are actually
`prerender_component` targets under the hood and have the same restrictions.

The best way to enforce that `prerender_component` targets are depended upon
correctly is to give each component its own Bazel package (directory with a
`BUILD.bazel` file). Leave each component slice with the implicit private
visibility and only mark the `prerender_component` target with a `visibility`
attribute to expose it outside the package.

```BUILD
# hello_world/blog_post_card/BUILD.bazel

load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@rules_prerender//:index.bzl", "prerender_component")

# Generates `:blog_post_card_prerender` aliased to `:prerender`.
prerender_component(
    name = "blog_post_card",
    prerender = ":prerender",
    # IMPORTANT: *Only* this target gets visibility outside the package.
    visibility = ["//hello_world:__subpackages__"],
)

# `prerender_component` depends on this, but nothing else does.
# It's even private visibility so no other targets *can* depend on it!
ts_project(
    name = "prerender",
    srcs = ["blog_post_card.tsx"],
    deps = ["//:node_modules/preact"],

    # No `visibility` on this target because it is used by `:blog_post_card`
    # above. This is left private, and all dependencies on `blog_post_card.tsx`
    # should go through the `:blog_post_card_prerender` alias.
    # visibility = ["..."],
)
```

This means any incoming dependencies on the `prerender_component` _must_ go
through the generated aliases, because directly depending on any of the slice
targets will be a visibility error. This structure is the best way to ensure
components are depended upon correctly throughout a project.
