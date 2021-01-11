# rules_prerender

A Bazel rule set for prerendering HTML pages.

![CI](https://github.com/dgp1130/rules_prerender/workflows/CI/badge.svg)

## Installation

NOTE: The project is not yet published, but this is the way it is expected to be
installed.

Start with a
[`rules_nodejs`](https://github.com/bazelbuild/rules_nodejs#quickstart) project,
if you already have one, great! If not, the easiest way to make one is:

```shell
npx @bazel/create ${NAME}
cd ${NAME}
npm install
npm run build # Confirm project is buildable.
```

Then install `rules_prerender` as a dev dependency. You must also satisfy a peer
dep on [`@bazel/typescript`](https://www.npmjs.com/package/@bazel/typescript),
which itself has a peer dep on
[`typescript`](https://www.npmjs.com/package/typescript).

```shell
npm install rules_prerender @bazel/typescript typescript --save-dev
```

Make sure to resolve any peer dep warnings and ensure that everything is using
compatible versions.

Last step is to update to your `WORKSPACE` file. Add:

```python
# `rules_webtesting` is necessary for `@bazel/concatjs` which provides the
# devserver implementation used by `rules_prerender`.
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
http_archive(
    name = "io_bazel_rules_webtesting",
    sha256 = "9bb461d5ef08e850025480bab185fd269242d4e533bca75bfb748001ceb343c3",
    urls = ["https://github.com/bazelbuild/rules_webtesting/releases/download/0.3.3/rules_webtesting.tar.gz"],
)
load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")
web_test_repositories()

# Load other `rules_prerender` dependencies.
load("@npm//rules_prerender:package.bzl", "rules_prerender_dependencies")
rules_prerender_dependencies()
```

And make sure your `npm_install()` rule has `strict_visibility = False`.

With that all done, you should be ready to use `rules_prerender`! See the next
section for how to use the API.

## API

The exact API is not currently nailed down, but it is expected to look something
like the following.

There are two significant portions of the rule set. The first defines a
"component": an HTML template and the associated JavaScript, CSS, and other web
resources (images, fonts, JSON) required for to it to function.

```python
# my_component/BUILD.bazel

load("@npm//@bazel/typescript:index.bzl", "ts_library")
load("@npm//rules_prerender:index.bzl", "prerender_component", "web_resources")

# A "library" target encapsulating the entire component.
prerender_component(
    name = "my_component",
    # The library which will prerender the HTML at build time in a Node process.
    srcs = ["my_component_prerender.ts"],
    # Dependent `prerender_library()` rules used by `my_component_prerender.ts`.
    deps = ["//my_other_component"],
    # Client-side JavaScript to be executed in the browser.
    scripts = [":scripts"],
    # Styles for the component.
    styles = ["my_component.css"],
    # Other resources required by the component.
    resources = [":resources"],
)

# Client-side scripts to be executed in the browser.
ts_library(
    name = "scripts",
    srcs = ["my_component.ts"],
    deps = ["//my_other_component:scripts"],
)

# Other resources required for this component to function at the URL paths they
# are expected to be hosted at.
web_resources(
    name = "resources",
    entries = {
        "/images/foo.png": ":foo.png",
        "/fonts/roboto.woff": "//fonts:roboto",
    },
)
```

```typescript
// my_component/my_component_prerender.ts
import { includeScript, includeStyle } from 'rules_prerender';
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
        ${includeScript('my_workspace/my_component/my_component')}

        <!-- Inject the associated CSS styles. -->
        ${includeStyle('my_workspace/my_component/my_component.css')}
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

```css
/* my_component/my_component.css */

/* Styles for the component. */
@font-face {
    font-family: Roboto;
    src: url(/fonts/roboto.woff); /* Use related web resources. */
}

.my-component-header {
    color: red;
    font-family: Roboto;
}
```

The second part of the rule set leverages such components to prerender an entire
web page.

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

load(
    "@npm//rules_prerender:index.bzl",
    "prerender_page_bundled",
    "web_resources",
    "web_resources_devserver",
)

# Renders the page, bundles JavaScript and CSS, injects the relevant
# `<script />` and `<style />` tags, and combines with all transitive resources
# to create a directory with the following paths:
#     /my_page/index.html - Final prerendered HTML page with CSS styles inlined.
#     /my_page/index.js - All transitive client-side JS source files bundled
#         into a single file.
#     /images/foo.png - The image used in `my_component`.
#     /fonts/roboto.woff - The Robot font used in `my_component`.
#     ... - Possibly other resources from `my_other_component` and transitive
#         dependencies.
prerender_page_bundled(
    name = "prerendered_page",
    # Script to invoke the default export of to generate the page.
    src = "my_page_prerender.ts",
    # The URL path this page to host this page at.
    path = "/my_page/index.html",
    # Components used during prerendering.
    deps = ["//my_component"],
)
```

The page is built into a `web_resources()` rule which is a directory that
contains its HTML, JavaScript, CSS, and other resources from all the
transitively included components at their expected paths.

Multiple `prerender_page_bundled()` directories can then be composed together
into a single `web_resources()` rule which contains a final directory of
everything merged together, representing an entire prerendered web site.

This final directory can be served with a simple devserver for local builds or
uploaded directly to a CDN for production deployments.

```python
# my_site/BUILD.bazel

load(
    "@npm//rules_prerender:index.bzl",
    "web_resources",
    "web_resources_devserver",
)

# Combines all the prerendered resources into a single directory, composing a
# site from a bunch of `prerender_page_bundled()` and `web_resources()` rules.
# Just upload this to a CDN for production builds!
web_resources(
    name = "my_site",
    deps = [
        "//my_page",
        "//another:page",
        "//blog:posts",
    ],
)

# A simple devserver implementation to serve the generated directory.
web_resources_devserver(
    name = "devserver",
    resources = ":site",
)
```

With this model, a user could do `ibazel run //my_site:devserver` to prerender
the entire application composed from various self-contained components in a fast
and incremental fashion. They could also just run `bazel build //my_site` to
generate the application as a directory and upload it to a CDN for production
deployments. They could even make a separate `bazel run //my_site:deploy` target
which performs the upload and run it from CI for easy deployments!

### Custom Bundling

The previous example automatically bundled all the JavaScript and CSS for a
given page. This is very simple and easy to use, but also somewhat limited. A
separate `prerender_page()` rule will provided unbundled JavaScript and CSS
resources so a user could manually bundle them with whatever means they like.

## Development

NOTE: If you encounter "Missing inputs" errors from `fsevents` or other optional
dependencies, consider using `npm ci` instead of `npm install`.
See: https://github.com/bazelbuild/rules_nodejs/issues/2395.

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

### Mocking

Most model types are stored under [//common/models/...](common/models/) and
generally consist of interfaces rather than classes. This provides immutable,
pure-data structured types which work well with functional design patterns. They
are also easy to assert in Jasmine with `expect().toEqual()`.

These models typically include a `_mock.ts` file which exposes `mock*()`
functions. These provide simple helpers to generate a mock for a model using
default values with override values as inputs. Using these mocks, a test can
explicitly specify only the properties of an object that it actually cares about
and trust that the mock function will provide reasonable and semantically
accurate defaults for all other values. For example:

```typescript
// Some model interface.
interface MyModel {
    name: string;
    path: string;
}

// Some real function.
function getName(model: MyModel): string {
    return model.name;
}

// A mock for the model.
function mockModel(overrides: Partial<MyModel> = {}): MyModel {
    return {
        name: 'MockName',
        // Default is semantically accurate, even if it is an arbitrary value.
        path: 'some/mocked/path.txt',
        // Allow caller to specify any given value.
        ...overrides,
    };
}

// Test of a real function.
it('`getName()` returns the name', () => {
    const model = mockModel({
        name: 'Ollie',
        // path uses the default value.
    });

    expect(getName(model)).toBe('Ollie');

    // There are several benefits with this approach:
    // 1.  `path` isn't used, so no need to specify it for the test, making the
    //     test and its intent much clearer.
    // 2.  If `path` is accidentally used for an important operation as part of
    //     `getName()`, the test would almost certainly fail and the `path`
    //     value can be explicitly specified as part of the test.
    // 3.  Even if `path` is used as part of unimportant operations in
    //     `getName()` (such as simply validating the type), it will not break
    //     the test because the default value is semantically accurate.
    // 4.  This isolates the test from unrelated changes to `MyModel`.
    //     Introducing another property is not likely to break `getName()` and
    //     would not require changes to the test to support.
});
```

This is a semi-experimental mocking strategy, so whether or not it is actually a
good idea is still to be determined.

## VSCode Snippets

The repository includes a few custom snippets available if you use VSCode. Type
the given name and hit <kbd>Tab</kbd> to insert the snippet. Then type out the
desired value for various parameters using <kbd>Tab</kbd> and
<kbd>Shift</kbd>+<kbd>Tab</kbd> to navigate between them. The snippet will take
care of making sure certain values match as expected.

*   Typing `ts_lib` in a `BUILD.bazel` file with a filename will generate a
    `ts_library()` rule for that file, a rule for its test file, and a
    `jasmine_node_test()` rule. Useful when creating a new file to auto-generate
    its default `BUILD` rules.
*   Typing `jas` in a TypeScript file will generate a base Jasmine setup with
    imports and an initial test with a `TODO`.
*   Typing `desc` in a TypeScript file will generate a Jasmine test suite,
    moving the cursor exactly where you want it to go.
*   Typing `it` in a TypeScript file will generate a Jasmine test, moving the
    cursor exactly where you want it to go. It will generate an `async` test by
    default, which you can either skip over with <kbd>Tab</kbd> to accept, or
    delete with <kbd>Backspace</kbd> (and then move on with <kbd>Tab</kbd>) to
    make synchronous.

## Publishing

The building and publishing process of this repository is a bit unique. Because
this project provides a bunch of build tools, things can get somewhat confusing.
A couple definitions for the purpose of publishing:

*   *Build time* - Execution of `bazel build` by a contributor to
    `rules_prerender` directly in this repository.
*   *Run time* - Execution of `bazel build` by a user of `rules_prerender`
    depending on it via `rules_nodejs` in the `@npm` workspace, or via a direct
    install in their `WORKSPACE` file.

Since the [`//examples/...`](/examples/) directory has direct references to the
same build tools as are exported to users, many of those tools must support
execution at both build time and run time. Some tools only need to support build
time execution (such as test targets).

The run time workspace is generated via a
[`pkg_npm()`](https://bazelbuild.github.io/rules_nodejs/Built-ins.html#pkg_npm)
target at [`//:pkg`](/BUILD.bazel). This includes pre-built binaries, config
files, `*.bzl` files, and even `BUILD` files. This is effectively a mini Bazel
workspace that is generated by another Bazel workspace.

Most of the implementation comes down to simply copying the right files to the
right place, however there are a couple things to keep in mind:

Many packages have a `BUILD.publish` file in additional to a `BUILD.bazel` file.
`BUILD.bazel` handles the *build time* `bazel build` command, responsible for
building code in `//examples/...` and the run time NPM package. The
`BUILD.publish` file handles the *run time* `bazel build` command, loaded at
`@npm//rules_prerender/...`. These two workspaces share a lot of the same code,
but `BUILD.bazel` generates its tools at HEAD, while `BUILD.publish` leverages
pre-built tools for most of the same work.

[`publish_files()`](/tools/publish.bzl) aggregates tools and their
`BUILD.publish` files for use in the run time package. If new files or tools are
needed at run time, then a `publish_files()` macro is needed to copy them into
the NPM package, and a `BUILD.publish` file may be needed to configure their
runtime usage and provide consistency with build time usage.

### Testing

Currently there are no automated tests of the published package or run time
builds (aside from a simple build test of the NPM package directory). To test
this manually, you need to:

1.  Build the NPM package in `rules_prerender`.
    *   This generates `dist/bin/pkg/` which contains the contents of the NPM
        package.

    ```shell
    bazel build //:pkg.pack
    ```
1.  Set up a separate Bazel workspace and `cd` into it.
    *   Easiest way to do this from scratch is:

        ```shell
        npx @bazel/create ${NAME}
        cd ${NAME}
        npm install
        ```
1.  Install the local `rules_prerender` build.

    ```shell
    npm install --save-dev path/to/rules_prerender/workspace/dist/bin/pkg
    ```
1.  Use `@npm//rules_prerender/...` and build some code.

Check out the
[`ref/external`](https://github.com/dgp1130/rules_prerender/tree/ref/external/)
branch which includes an in-tree user workspace which can be used to more easily
verify and debug run time execution.
