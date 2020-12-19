# rules_prerender

A Bazel rule set for prerendering HTML pages.

![CI](https://github.com/dgp1130/rules_prerender/workflows/CI/badge.svg)

## API

The exact API is not currently nailed down, but it is expected to look something
like the following.

There are two significant portions of the rule set. The first defines a
"component": an HTML template and the associated JavaScript, CSS, and other web
resources (images, fonts, JSON) required for to it to function.

```python
# my_component/BUILD.bazel

load("@io_bazel_rules_sass//:defs.bzl", "sass_library")
load("@npm//@bazel/typescript:index.bzl", "ts_library")
load("@npm//rules_prerender:index.bzl", "prerender_library", "web_resources")

# A library encapsulating the entire component.
prerender_library(
    name = "my_component",
    # The library which will prerender the HTML at build time in a Node process.
    srcs = ["my_component_prerender.ts"],
    # Dependent `prerender_library()` rules used by `my_component_prerender.ts`.
    deps = ["//my_other_component"],
    # Client-side JavaScript to be executed in the browser.
    scripts = [":scripts"],
    # Styles for the component.
    styles = [":styles"],
    # Other resources required by the component.
    resources = [":resources"],
)

# Client-side scripts to be executed in the browser.
ts_library(
    name = "scripts",
    srcs = ["my_component.ts"],
    deps = ["//my_other_component:scripts"],
)

# Styles for the HTML in this component.
sass_library(
    name = "styles",
    srcs = ["my_component.scss"],
)

# Other resources required for this component to function at the URLs they are
# expected to be hosted at.
web_resources(
    name = "resources",
    contents = {
        "/images/foo.png": ":foo.png",
        "/fonts/roboto.woff": "//fonts:roboto",
    },
)
```

```typescript
// my_component/my_component_prerender.ts
import { injectScript, injectStyle } from 'rules_prerender';
import { renderOtherComponent } from '__main__/my_other_component/my_other_component_prerender';

/**
 * Render partial HTML. In this case we're just using a string literal, but you
 * could reasonably use lit-html, React, or any other templating library.
 */
export function renderMyComponent(name: string): string {
    return `
        <!-- Render some HTML. -->
        <h2 class="my-component-header">Hello, ${name}</h2>!
        <button id="show">Show</button>

        <!-- Use related web resources. -->
        <img src="/images/foo.png" />

        <!-- Compose other components. -->
        ${renderOtherComponent({
            id: 'other',
            name: name.reverse(),
        })}

        <!-- Inject the associated client-side JavaScript. -->
        ${injectScript('my_component.js')}

        <!-- Inject the associated CSS styles. -->
        ${injectStyle('my_component.css')}
    `;
}
```

```typescript
// my_component/my_component.ts

import {show} from '__main__/my_other_component/my_other_component';

// Register an event handler to show the other component. Could just as easily
// use a framework like Angular, LitElement, React, or just define an
// implementation for a custom element that was prerendered.

document.addEventListener('DOMContentLoaded', () => {
    // When the "Show" button is clicked.
    document.getElementById('show').addEventListener('click', () => {
        // Show the composed `other` component.
        show(document.getElementById('other'));
    });
});
```

```scss
/* my_component/my_component.scss */

/* Styles for the component. */
@font-face {
    font-family: Roboto;
    src: url(/fonts/roboto.woff);
}

.my-component-header {
    color: red;
    font-family: Roboto;
}
```

Given components of this format which are composed with each other to construct
progressively higher-level components, we can eventually render a complete web
page.

```typescript
// my_page_prerender.ts

import { renderMyComponent } from '__main__/my_component/my_component_prerender';

export default function render(): string {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>My Page</title>
            </head>
            <body>
                ${renderMyComponent('World')}
            </body>
        </html>
    `;
}
```

```python
# my_page/BUILD

load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")
load("@npm//@bazel/rollup:index.bzl", "rollup_bundle")
load(
    "@npm//rules_prerender:index.bzl",
    "inject_resources",
    "prerender_binary",
    "web_resources",
)

# Generates:
#   prerendered_page.html - Rendered HTML content with no JS or CSS yet.
#   :prerendered_page_scripts - JavaScript sources from transitive dependencies.
#   :prerendered_page_styles - CSS sources from transitive dependencies.
#   :prerendered_page_resources - Other web resources from transitive dependencies.
prerender_binary(
    name = "prerendered_page",
    # Script to invoke the default export of to generate the page.
    src = "my_page_prerender.ts",
    deps = ["//my_component"],
)

# Bundle the scripts to a single `bundle.js` file. Could use any bundler.
rollup_bundle(
    name = "bundle",
    srcs = [":prerendered_page_scripts"],
    # ...
)

# Bundle the CSS to a single `styles.css` file. Could use any bundler.
sass_binary(
    name = "styles",
    src = ":prerendered_page_styles",
)

# Generates `injected_page.html` with JS and CSS inserted into the HTML.
inject_resources(
    name = "injected_page",
    # Base HTML page to inject JS and CSS resources into.
    page = "prerendered_page.html",
    # Inject JavaScript as a link `<script src="/my_page/scripts.js"></script>`
    scripts = [
        {
            path: "/my_page/scripts.js",
        },
    ],
    # Inject CSS as an inline `<style></style>` tag.
    styles = [
        {
            inline: True,
            src: "styles.css",
        },
    ],
)

# Assemble all the resources into a single directory at the right paths.
# Generates a directory with the following paths:
#   /my_page/index.html - Final prerendered HTML page.
#   /my_page/scripts.js - All transitive JS sources bundled to a single file.
#   /images/foo.png - The image used in `my_component`.
#   /fonts/roboto.woff - The Robot font used in `my_component`.
#   ... - Possibly other resources from `my_other_component`.
web_resources(
    name = "my_page",
    # Set up HTML and linked JS at appropriate locations.
    contents = {
        "/my_page/index.html": "injected_page.html",
        "/my_page/scripts.js": "bundle.js",
    },
    # Also include any resources required in transitive deps.
    deps = [":prerendered_page_resources"],
)
```

With each page represented as a `web_resources()` directory of all the
transitive resources required to load that page, we can then build a site by
simply merging all the individual pages!

```python
# my_site/BUILD.bazel

load("@npm//rules_prerender", "web_resources", "web_resources_devserver")

# Merge all the individual `web_resources()` rules to build a singular site,
# expressed as a simple directory.
web_resources(
    name = "my_site",
    deps = [
        "//my_page",
        "//my_other_page",
        # ...
    ],
)

# Some means of serving the directory as static files, likely using
# `ts_devserver()`.
web_resources_devserver(
    name = "devserver",
    deps = [":my_site"],
)
```

With this model, a user could do `ibazel run //my_site:devserver` to prerender
the entire application composed from various self-contained components in a fast
and incremental fashion.

## Development

There are `bazel` and `ibazel` scripts in `package.json` so you can run any
Bazel command with:

```shell
npm run -s -- bazel # ...
```

Or, if you want to live-reload on changes:

```shell
npm run -s -- ibazel # ...
```

Alternatively, you can run `npm install -g @bazel/bazelisk @bazel/ibazel` to get
a global install of `bazel` and `ibazel` on your `$PATH` and just use them
directly instead of proxying through the NPM wrapper scripts. This repository
has a [`.bazelversion`](./.bazelversion) file used by `bazelisk` to manage and
download the correct Bazel version for you and pass through all commands to it
(not totally sure if it applies to `ibazel` though).

You can also use `npm run build` and `npm test` to build and test everything.

## Testing

Most tests are run in [Jasmine](https://jasmine.github.io/) using
[`jasmine_node_test()`](https://www.npmjs.com/package/@bazel/jasmine#jasmine_node_test).
These can be executed with a simple `bazel test //path/to/pkg:target`.

### Debugging Tests

To debug these tests, simply add `--config debug`, which will opt in to
additional flags specifically for testing. Most notably, this includes
`--inspect-brk` so Node will not begin executing until a debugger has connected.
You can use `chrome://inspect` or the "Attach" run configuration in VSCode to
attach a debugger and start test execution.

Source maps should be set up and usable, however `rules_nodejs` currently
compiles everything to ES5, so `async/await` gets transpiled to generators,
meaning stepping over an `await` can be quite fiddly sometimes. When using
`chrome://inspect`, consider using the `debugger;` keyword at a particular file
in order to stop execution programmatically and then set interactive breakpoints
via the DevTools debugger itself. Otherwise most files are not loaded at the
time `--inspect-brk` stops execution.

### Debugging Puppeteer/Chrome tests

When debugging a test that launches Chrome via
[Puppeteer](https://www.npmjs.com/package/puppeteer) and using `--config debug`,
the browser will open non-headless, giving you the opportunity to visual inspect
the page under test and debug it directly. This is done via an X server, so make
sure the `$DISPLAY` variable is set. For example, if debugging over SSH, you'll
need to enable X11 forwarding.

When using [WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install-win10) a
there is also some forwarding required. WSL 2 does not currently support
graphical applications out of the box and Windows does not ship with an X server
implementation. To get this working, you need to:

1.  Install an X server for Windows (such as
    [VcXsrv](https://sourceforge.net/projects/vcxsrv/))
1.  Launch the X server and set it up enable public access (for VcXsrv, this is
    the "Disable access control" box).
1.  When Windows Defender pops up about network permissions, allow access for
    private **and public** networks.
1.  In the WSL Ubuntu terminal, run:
    ```shell
    export DISPLAY=$(awk '/nameserver / {print $2; exit}' /etc/resolv.conf 2>/dev/null):0
    ```
    Consider adding it to your `~/.bashrc` so you don't have to remember to do
    this.

Then running a `bazel test --config debug //path/to/pkg:target` for a Puppeteer
test should open Chrome visually and give you an opportunity to debug and
inspect the page.
