# rules_prerender

A Bazel rule set for prerendering HTML pages.

![CI](https://github.com/dgp1130/rules_prerender/workflows/CI/badge.svg)

NOTE: This project is currently **experimental**. Feel free to install it to try
it out, give feedback, and suggest improvements! Just don't use it in production
quite yet.

## Installation

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

You will also need a `tsconfig.json`. Easiest way to generate one is with:

```shell
npx typescript --init
```

See
[`rules_typescript` suggestions](https://bazelbuild.github.io/rules_nodejs/TypeScript.html#writing-typescript-code-for-bazel)
to set up absolute imports.

Last step is to update to your `WORKSPACE` file. Add:

```python
# Load other `rules_prerender` dependencies.
load("@npm//rules_prerender:package.bzl", "rules_prerender_dependencies")
rules_prerender_dependencies()
```

And make sure your `npm_install()` rule has `strict_visibility = False`.

With that all done, you should be ready to use `rules_prerender`! See the next
section for how to use the API, or you can check out
[some examples](/examples/site/) which shows most of the relevant features in
action (note that where they depend on `//packages/rules_prerender`, you should
depend on `@npm//rules_prerender`).

## API

The exact API is not currently nailed down, but it is expected to look something
like the following.

There are two significant portions of the rule set. The first defines a
"component": an HTML template and the associated JavaScript, CSS, and other web
resources (images, fonts, JSON) required for to it to function.

```python
# my_component/BUILD.bazel

load("@npm//@bazel/typescript:index.bzl", "ts_project")
load("@npm//rules_prerender:index.bzl", "prerender_component", "web_resources")

# A "library" target encapsulating the entire component.
prerender_component(
    name = "my_component",
    # The library which will prerender the HTML at build time in a Node process.
    srcs = ["my_component_prerender.ts"],
    # Other `ts_project()` targets used by `my_component_prerender.ts`.
    lib_deps = ["@npm//rules_prerender"],
    # Other `prerender_component()` rules used by `my_component_prerender.ts`.
    deps = ["//my_other_component"],
    # Client-side JavaScript to be executed in the browser.
    scripts = [":scripts"],
    # Styles for the component.
    styles = [":styles"],
    # Other resources required by the component.
    resources = [":resources"],
)

# Client-side scripts to be executed in the browser.
ts_project(
    name = "scripts",
    srcs = ["my_component.ts"],
    declaration = True,
    deps = ["//my_other_component:scripts"],
)

css_library(
    name = "styles",
    srcs = ["my_component.css"],
    deps = ["//some_common_package:styles"],
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

import { includeScript, inlineStyle } from 'rules_prerender';
import { renderOtherComponent } from '../my_other_component/my_other_component_prerender';

/**
 * Render partial HTML. In this case we're just using a string literal, but you
 * could reasonably use lit-html, React, or any other templating library.
 */
export function renderMyComponent(name: string): string {
    return `
<div>
    <!-- Use declarative shadow DOM to isolate styles. If you're not familiar with
    declarative shadow DOM, you don't have to use it. But if you don't you'll need
    to manually namespace your styles or else styles in different components could
    conflict with each other! -->
    <template shadowroot="open">
        <!-- Render some HTML. -->
        <h2 class="my-component-header">Hello, ${name}</h2>!
        <button id="show">Show</button>

        <!-- Use related web resources. -->
        <img src="/images/foo.png" />

        <!-- Compose other components via light DOM. -->
        <slot></slot>

        <!-- Inject the associated client-side JavaScript. -->
        ${includeScript('my_component/my_component')}

        <!-- Inline the associated CSS styles, scoped to this shadow root. -->
        ${inlineStyle('my_workspace/my_component/my_component.css')}
    </template>
    
    <!-- Other components are placed in light DOM and visible at the \`<slot />\`. -->
    ${renderOtherComponent({
        id: 'other',
        name: name.reverse(),
    })}
</div>
    `;
}
```

```typescript
// my_component/my_component.ts

import { show } from '../my_other_component/my_other_component';

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

/* @import dependencies resolved and bundled at build time. */
@import '../some_common_package/styles.css';

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
// my_page/my_page_prerender.ts

import { PrerenderResource } from 'rules_prerender';
import { renderMyComponent } from '../my_component/my_component_prerender';

// Renders HTML pages for the site at build-time.
// If you aren't familiar with generators and the `yield` looks scary, you could
// also write this as simply returning an `Array<PrerenderResource>`.
export default function* render(): Generator<PrerenderResource, void, void> {
    // Generate an HTML page at `/my_page/index.html` with this content:
    yield PrerenderResource.of('/my_page/index.html', `
<!DOCTYPE html>
<html>
    <head>
        <title>My Page</title>
    </head>
    <body>
        ${renderMyComponent('World')}
    </body>
</html>
    `.trim());
}
```

```python
# my_page/BUILD.bazel

load(
    "@npm//rules_prerender:index.bzl",
    "prerender_pages",
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
prerender_pages(
    name = "prerendered_page",
    # Script to invoke the default export of to generate the page.
    src = "my_page_prerender.ts",
    # Components used during prerendering.
    deps = ["//my_component"],
)

# Simple server to test out this page. `bazel run` / `ibazel run` this target to
# check out the page at `/my_page/index.html`.
web_resources_devserver(
    name = "devserver",
    resources = ":prerendered_page",
)
```

The page is built into a `web_resources()` rule which is a directory that
contains its HTML, JavaScript, CSS, and other resources from all the
transitively included components at their expected paths.

Multiple `prerender_pages()` directories can then be composed together into a
single `web_resources()` rule which contains a final directory of everything
merged together, representing an entire prerendered web site.

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
# site from a bunch of `prerender_pages()` and `web_resources()` rules. Just
# upload this to a CDN for production builds!
web_resources(
    name = "my_site",
    deps = [
        "//my_page",
        "//another:page",
        "//blog:posts",
    ],
)

# A simple devserver implementation to serve the entire site.
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

### Generating multiple pages

We can generate multiple pages just as easily as the one. We just need to yield
more files. Take this example where we render HTML files for a bunch of markdown
posts in a blog.

```typescript
// my_blog/posts_prerender.ts

import * as fs from 'fs';
import { PrerenderResource } from 'rules_prerender';
import * as md from 'markdown-it';

export default async function* render():
        AsyncGenerator<PrerenderResource, void, void> {
    // List all files in the `posts/` directory.
    const postsDir = `${process.env['RUNFILES']}/wksp/my_blog/posts`;
    const posts = await fs.readdir(postsDir, { withFileTypes: true });

    for (const post of posts) {
        // Read the post markdown, convert it to HTML, and then emit the file to
        // `rules_prerender` which will write it at
        // `/post/${post_file_name_with_html_extension}`.
        const postMarkdown = await fs.readFile(post, { encoding: 'utf8' });
        const postHtml = md.render(postMarkdown);
        const htmlName = post.split('.').slice(0, -1).join('.') + '.html';
        yield PrerenderResource.of(`/posts/${htmlName}`, postHtml);
    }
}
```

We can easily execute this at build time like so:

```python
# my_blog/BUILD.bazel

load(
    "@npm//rules_prerender:index.bzl",
    "prerender_pages",
    "web_resources_devserver",
)

# Renders a page for every `posts/*.md` file. Also performs all the bundling and
# merging of required JS, CSS, and other resources.
prerender_pages(
    name = "prerendered_posts",
    # Script to invoke the default export of to generate the page.
    src = "posts_prerender.ts",
    # Other files needed to generate all the HTML.
    data = glob(["posts/*.md"]),
    # Plain TypeScript dependencies used by `posts_prerender.ts`.
    lib_deps = [
        "@npm//rules_prerender",
        "@npm//markdown-it",
        "@npm//@types/markdown-it",
        "@npm//@types/node",
    ],
)

# Simple server to test out this page. `bazel run` / `ibazel run` this target to
# check out the posts at `/posts/*.html`.
web_resources_devserver(
    name = "devserver",
    resources = ":prerendered_posts",
)
```

With this, all markdown posts in the `posts/` directory will get generated into
HTML files. Using this strategy, we can scale static-site generation for a large
number of files with common generation patterns.

### Custom Bundling

The previous example automatically bundled all the JavaScript and CSS for a
given page. This is very simple and easy to use, but also somewhat limited. The
`prerender_pages_unbundled()` rule provides unbundled JavaScript and CSS
resources so a user can manually bundle them with whatever means they like.

There is also an `extract_single_resource()` rule, which pulls out a resource
from a directory generated by a `prerender_*()` rule (assuming the directory
contains only one resource). This can be useful to post-process a prerendered
resource with tools that expect a single file as input, rather than a directory.

## Development

To get started, simply download / fork the repository and run:

```shell
bazel run @nodejs_host//:npm -- ci
bazel test //...
```

Prefer using `bazel run @nodejs_host//:npm -- ...` and
`bazel run @nodejs_host//:node -- ...` over using `npm` and `node` directly so they
are strongly versioned with the repository. Alternatively, you can install
[`nvm`](https://github.com/nvm-sh/nvm) and run `nvm use` to switch the `node`
and `npm` commands to use the correct versions in this repository.

NOTE: If you encounter "Missing inputs" errors from `fsevents` or other optional
dependencies, make sure you are using `npm ci` instead of `npm install`.
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
`jasmine_node_test()`, a
[slightly customized implementation of `@aspect_rules_jasmine`](/tools/jasmine.bzl).
These tests run in a Node Jasmine environment with no available browser (unless
they depend on WebDriverIO). The test can be executed with a simple
`bazel test //path/to/pkg:target`.

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

### Debugging WebDriver tests

End-to-end tests using a real browser are done with WebDriver using
[`jasmine_web_test_suite()`](./tools/jasmine_web_test_suite.bzl).

When executing WebDriver tests and using `--config debug`, the browser will open
non-headless, giving you the opportunity to visually inspect the page under test
and debug it directly. This is done via an X server, so make sure the `$DISPLAY`
variable is set. For example, if debugging over SSH, you'll need to enable X11
forwarding.

When using [WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install-win10)
there is also some additional configuration required. WSL 2 does not currently
support graphical applications out of the box and Windows does not ship with an
X server implementation (this may be unnecessary with
[WSLg](https://github.com/microsoft/wslg), but that hasn't been tested). To
debug end-to-end tests in WSL 2, you need to:

1.  Install an X server for Windows (such as
    [VcXsrv](https://sourceforge.net/projects/vcxsrv/))
2.  Launch the X server and set it up enable public access (for VcXsrv, this is
    the "Disable access control" box).
3.  When Windows Defender pops up about network permissions, allow access for
    private **and public** networks.
4.  In the WSL Ubuntu terminal, run:
    ```shell
    export DISPLAY=$(awk '/nameserver / {print $2; exit}' /etc/resolv.conf 2>/dev/null):0
    ```
    Consider adding it to your `~/.bashrc` so you don't have to remember to do
    this.

Then running a `bazel test //path/to/pkg:target --config debug` for a WebDriver
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

*   Typing `ts_proj` in a `BUILD.bazel` file with a filename will generate a
    `ts_project()` rule for that file, a rule for its test file, and a
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

### Releasing

To actually publish a release to NPM, follow these steps:

1.  Consider [testing the release](#testing-publishable-builds).
    *   No need for `bazel test //...`, the release process will do it for you.
1.  Go to the
    [Publish workflow](https://github.com/dgp1130/rules_prerender/actions?query=workflow%3APublish)
    and click `Run workflow`.
    *   Make sure to fill out all the requested information.
    *   This will install the package, execute all tests, and then publish as
        the given semver to NPM.
    *   It will also tag the commit with `releases/${semver}` and push it back
        to the repository.
    *   Finally, it will create a *draft* GitHub release for that tag with a
        link to NPM for this particular version.
1.  Once the workflow is complete, go to
    [releases](https://github.com/dgp1130/rules_prerender/releases) to update
    the draft and add a changelog or other relevant information before
    publishing.
