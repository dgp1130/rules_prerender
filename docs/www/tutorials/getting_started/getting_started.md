---
title: Getting Started
---

This tutorial describes how to get started with a new `@rules_prerender`
project, create your first component, then build and run your site.

NOTE: This tutorial is a work-in-progress. It may be incomplete or assume
pre-existing knowledge of certain related topics. If you are interested in
trying out `@rules_prerender` today, consider reaching out on a
[GitHub issue or discussion](https://github.com/dgp1130/rules_prerender) for
direct assistance.

## 0. Prerequisites

Some basic knowledge of the following is required to understand this tutorial:

*   [HTML](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics)
*   [JavaScript](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics)
*   [Bazel](https://bazel.build/)
*   General understanding of using a terminal / command line environment.

Additional knowledge of the following is _helpful_, but not required to
understand this tutorial:

*   [TypeScript](https://www.typescriptlang.org/)
    *   This particular tutorial uses TypeScript, which is strongly recommended
        for `@rules_prerender` projects.
    *   It is possible to use `@rules_prerender` with pure JavaScript if
        desired.
*   [`@aspect_rules_js`](https://docs.aspect.build/rulesets/aspect_rules_js)

TODO: `npm init` support.

## 1. Install Node.js

The first step is to
[download and install Node.js](https://nodejs.org/en/download). Consider using
[Node Version Manager (NVM)](https://github.com/nvm-sh/nvm) to automatically
manage multiple Node versions for you.

TODO: Supported Node versions. Can we extract this information from `engines`?

## 2. Install Bazel

Next, [install Bazel itself](https://bazel.build/start). There are numerous ways
to do this based on your environment.
[Bazelisk](https://bazel.build/install/bazelisk) is recommended as it can manage
multiple Bazel versions (like NVM). For web projects like `@rules_prerender`
consider installing the
[`@bazel/bazelisk`](https://www.npmjs.com/package/@bazel/bazelisk) (and
[`@bazel/ibazel`](https://www.npmjs.com/package/@bazel/ibazel)) NPM packages.
The `-g` flag will make the `bazel` and `ibazel` commands available globally.

```shell
npm install -g @bazel/bazelisk @bazel/ibazel
```

TODO: Supported Bazel versions.

## 3. Set up `@rules_prerender`

`@rules_prerender` includes both a Bazel ruleset (`@rules_prerender`) _and_ a
set of NPM packages (`rules_prerender`, `@rules_prerender/*`). Both must be
installed to use the toolchain.

### Install the Bazel ruleset

Create a new project with `@rules_prerender` by making a new directory and
following the documentation for the
[most recent release](https://github.com/dgp1130/rules_prerender/releases).

This will include the configuration necessary for
[`@aspect_rules_js`](https://docs.aspect.build/rulesets/aspect_rules_js/), a
required dependency. Make sure to also create a root `package.json` file,
[install it with `pnpm`](https://docs.aspect.build/rulesets/aspect_rules_js/docs/#fetch-third-party-packages-from-npm)
and
[link the packages](https://docs.aspect.build/rulesets/aspect_rules_js/docs/#link-the-node_modules)
in Bazel.

TODO: This is not very clear and assumes too much pre-existing knowledge
(`WORKSPACE`, `npm_link_all_packages`, `pnpm`).

### Install JavaScript runtime

The required JavaScript exists in the
[`rules_prerender`](https://www.npmjs.com/package/rules_prerender) package, as
well as number of optional, useful utilities in `@rules_prerender/*` packages.
[Preact](https://preactjs.com/) and
[TypeScript](https://www.typescriptlang.org/) should also be included. These
dependencies are necessary for this tutorial, however they are not strictly
required to use `@rules_prerender`. Install the recommended set of packages with
the following command:

```shell
pnpm install rules_prerender @rules_prerender/preact preact @rules_prerender/declarative_shadow_dom typescript --save-dev
```

TODO: Explain the shift to `pnpm`?

### Set up TypeScript

Configure TypeScript for the new project and create a `tsconfig.json` file by
running:

```shell
node_modules/.bin/tsc --init
```

Make sure the following settings are enabled:

```jsonc
// tsconfig.json

{
    "compilerOptions": {
        "module": "ES2020", // Use ES2015 or greater. CommonJS is *not* supported.
        "target": "ES2020", // Use ES2015 or greater.

        // Enable JSX with Preact.
        "jsx": "react-jsx",
        "jsxImportSource": "preact",

        "moduleResolution": "node",
    }
}
```

You should also export the `tsconfig.json` file in the root `BUILD.bazel` file
so it can be used anywhere in the project.

```BUILD
# BUILD.bazel

exports_files(["tsconfig.json"], visibility = ["//visibility:public"])
```

TODO: Is this a complete set of required options? Should the "recommended"
values be more recent?

### Set up declarative shadow DOM

The last piece of set up is to enable use of
`@rules_prerender/declarative_shadow_dom`. This package is slightly unique in
that is an NPM package which includes a complete
[`prerender_component`](#TODO-link-to-reference-docs) (more on this later). As a
result, it needs to be linked in the Bazel layer, similar to
[`npm_link_all_packages`](https://docs.aspect.build/rulesets/aspect_rules_js/docs/#link-the-node_modules)
in `@aspect_rules_js`.

Add the following to the root `BUILD.bazel` file:

```BUILD
load("@rules_prerender//:index.bzl", "link_prerender_component")

link_prerender_component(
    name = "prerender_components/@rules_prerender/declarative_shadow_dom",
    package = ":node_modules/@rules_prerender/declarative_shadow_dom",
    visibility = ["//visibility:public"],
)
```

And now you should be good to go!

## Create your first site

Create a new directory called `hello_world`, this will contain all the code
necessary to generate a new site.

### Write the TypeScript

Create a `hello_world/hello_world.tsx` file in it. This will generate the site's
HTML content at build time.

TODO: Multi-file source code viewer.

```tsx
// hello_world/hello_world.tsx

import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';

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
            </body>
        </html>
    ));
}
```

This function generates an `index.html` page in the root of the output directory
and renders the TSX content.

### Build the TypeScript

Next, configure the build by create a `hello_world/BUILD.bazel` file which
compiles this code with TypeScript using a
[`ts_project`](https://docs.aspect.build/rulesets/aspect_rules_ts/docs/rules#ts_project)
target from
[`@aspect_rules_ts`](https://docs.aspect.build/rulesets/aspect_rules_ts).

TODO: Confirm `@aspect_rules_ts` does not require any set up steps.

```BUILD
# hello_world/BUILD.bazel

load("@aspect_rules_ts//ts:defs.bzl", "ts_project")

ts_project(
    name = "prerender",
    srcs = ["hello_world.tsx"],
    tsconfig = "//:tsconfig.json",
    deps = [
        "//:node_modules/@rules_prerender/preact",

        # We didn't import `preact`, but anytime we use JSX/TSX we need this
        # dependency.
        "//:node_modules/preact",
    ],
)
```

Consider building the target to verify that the TypeScript code is compiling
correctly.

```shell
bazel build //hello_world:prerender
```

### Build the site

Finally, configure the build to execute the above TypeScript code and generate
the HTML file. This is done by editing the `hello_world/BUILD.bazel` to include
a [`prerender_pages`](#TODO-link-to-reference-docs) target.

```BUILD
# hello_world/BUILD.bazel

load("@rules_prerender//:index.bzl", "prerender_pages")

# Invokes the given `entry_point` at build time, renders the HTML, writes it to
# a file and bundles any JavaScript, CSS, or static resources.
prerender_pages(
    name = "site",
    # Import specifier for the JavaScript output from `:prerender` which
    # generates the page.
    entry_point = "./hello_world.js",
    # Depend on the `ts_project` target which builds `hello_world.js`.
    prerender = ":prerender",
)

# Existing `:prerender` target...
```

During a build, `prerender_pages` will load the JavaScript file referenced by
`entry_point` and invoke its `default export` function. Any `PrerenderResource`
objects output by this function are written to the output directory (a
[tree artifact](https://bazel.build/reference/glossary#tree-artifact)).

Build and verify the project by running the following command:

```shell
bazel build //hello_world:site
```

This should generate a directory at `bazel-bin/hello_world/site` containing a
single `index.html` file with the rendered content.

### Serve the site

An easy way to serve and view the built web site is to use
[`web_resources_devserver`](#TODO-link-to-reference-docs) by adding the
following to the `hello_world/BUILD.bazel` file:

```BUILD
# hello_world/BUILD.bazel

load("@rules_prerender//:index.bzl", "web_resources_devserver")

# Existing `:site` and `:prerender` targets...

# Small dev server to test out this page.
web_resources_devserver(
    name = "devserver",
    resources = ":site", # `prerender_pages` target to serve.
)
```

Run the devserver with the following command:

```shell
bazel run //hello_world:devserver
```

This should build the project and serve it in a dev server. Open
http://localhost:8080/ to view the web site.

TIP: Use [`ibazel run`](https://github.com/bazelbuild/bazel-watcher/) instead of
`bazel run` to get automatic rebuilds when source files change and live reload
the page.

NOTE: `web_resources_devserver` is a static file server with limited
functionality. It is intended for development purposes only and should *never*
be used in production

Congratulations! You have successfully built and served a web site with
`@rules_prerender`. Continue on to write your first `prerender_component` in the
[next tutorial](/tutorials/components/).
