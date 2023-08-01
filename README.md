# rules_prerender

A Bazel rule set for prerendering HTML pages.

![CI](https://github.com/dgp1130/rules_prerender/workflows/CI/badge.svg)

NOTE: This project is currently **experimental**. Feel free to install it to try
it out, give feedback, and suggest improvements! Just don't use it in production
quite yet.

## Installation

Start with an [`@aspect_rules_js`](https://github.com/aspect-build/rules_js/)
project.

Then add a workspace dependency on `@rules_prerender`. See the
[releases](https://github.com/dgp1130/rules_prerender/releases/) page for the
latest release and copy the snippet into your `WORKSPACE` file. Then install the
`rules_prerender` NPM package. We'll also want `@rules_prerender/preact` and
[`preact`](https://www.npmjs.com/package/preact) itself to use JSX as a
templating system.

```bash
pnpm install rules_prerender @rules_prerender/preact preact --save-dev
```

### TypeScript

Optionally, you likely want to configure TypeScript by installing it and
creating a `tsconfig.json` file.

```bash
pnpm install typescript --save-dev
node_modules/.bin/tsc --init
```

### Declarative Shadow DOM

Also optional, but it is recommended to include the declarative shadow DOM
package as it is a key part of `@rules_prerender` components.

```bash
pnpm install @rules_prerender/declarative-shadow-dom --save-dev
```

Then update your root `BUILD.bazel` file to include:

```python
load("@rules_prerender//:index.bzl", "link_prerender_component")

link_prerender_component(
    name = "prerender_components/@rules_prerender/declarative_shadow_dom",
    package = ":node_modules/@rules_prerender/declarative_shadow_dom",
    visibility = ["//visibility:public"],
)
```

With that all done, you should be ready to use `rules_prerender`! See the next
section for how to use the API, or you can check out
[some examples](/examples/site/) which shows most of the relevant features in
action.

## API

The exact API is not currently nailed down, but it is expected to look something
like the following.

There are two significant portions of the rule set. The first defines a
"component": an HTML template and the associated JavaScript, CSS, and other web
resources (images, fonts, JSON) required for to it to function.

```python
# my_component/BUILD.bazel

load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@rules_prerender//:index.bzl", "prerender_component", "web_resources")

# A "library" target encapsulating the entire component.
prerender_component(
    name = "my_component",
    # The library which will prerender the HTML at build time in a Node process.
    prerender = ":prerender",
    # Client-side JavaScript to be executed in the browser.
    scripts = ":scripts",
    # Styles for the component.
    styles = ":styles",
    # Other resources required by the component (images, fonts, static JSON, etc.).
    resources = ":resources",
)

# Compile the prerendering logic (can also be a `js_library`).
ts_project(
    name = "prerender",
    srcs = ["my_component_prerender.tsx"],
    deps = [
        # See "Component composition" to learn more about how to depend on
        # another `prerender_component`.
        "//my_other_component:my_other_component_prerender",
        "//:prerender_components/@rules_prerender/declarative_shadow_dom_prerender",

        # Regular dependencies.
        "//:node_modules/@rules_prerender/preact",
        "//:node_modules/preact",
    ],
)

# Client-side scripts to be executed in the browser (can also be a `js_library`).
ts_project(
    name = "scripts",
    srcs = ["my_component.mts"],
    declaration = True,
    deps = ["//some/other/package:ts_proj"],
)

# Any styles needed by this component to render correctly.
css_library(
    name = "styles",
    srcs = ["my_component.css"],
    deps = ["//some/other/package:css_lib"],
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

```tsx
// my_component/my_component_prerender.tsx

import { polyfillDeclarativeShadowDom } from '@rules_prerender/declarative_shadow_dom/preact.mjs';
import { Template, includeScript, inlineStyle } from '@rules_prerender/preact';
import { VNode } from 'preact';
import { OtherComponent } from '../my_other_component/my_other_component_prerender.js';

/** Render partial HTML with Preact. */
export function MyComponent({ name }: { name: string }): VNode {
    return <div>
        {/* Use declarative shadow DOM to isolate styles. If you're not familiar
            with declarative shadow DOM, you don't have to use it. But if you
            don't you'll need to manually namespace your styles or else styles
            in different components could conflict with each other! */}
        <Template shadowrootmode="open">
            {/* Polyfill declarative shadow DOM for any browsers which don't
                support it. */}
            {polyfillDeclarativeShadowDom()}

            {/* Render some HTML. */}
            <h2 class="my-component-header">Hello, {name}</h2>!
            <button id="show">Show</button>

            {/* Use related web resources. */}
            <img src="/images/foo.png" />

            {/* Compose other components from the light DOM. */}
            <slot></slot>

            {/* Inject the associated client-side JavaScript. */}
            {includeScript('./my_component.mjs', import.meta)}

            {/* Inline the associated styles, scoped to this shadow root. */}
            {inlineStyle('./my_component.css', import.meta)}
        </Template>

        {/* Other components should be placed in light DOM and visible at the
            `<slot />`. */}
        <OtherComponent id="other" name={name.reverse()} />
    </div>;
}
```

```typescript
// my_component/my_component.mts

import { showDialog } from '../some/other/package/show_dialog.mjs';

// Register an event handler to show the other component. Could just as easily
// use a framework like Angular, LitElement, React, or just define an
// implementation for a custom element that was prerendered.
document.getElementById('show').addEventListener('click', () => {
    // Show the composed `other` component.
    showDialog(document.getElementById('other'));
});
```

```css
/* my_component/my_component.css */

/* @import dependencies resolved and bundled at build time. */
@import '../some/other/package/styles.css';

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

```tsx
// my_page/my_page_prerender.tsx

import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';
import { MyComponent } from '../my_component/my_component_prerender.js';

// Renders HTML pages for the site at build-time.
// If you aren't familiar with generators and the `yield` looks scary, you could
// also write this as simply returning an `Array<PrerenderResource>`.
export default function* render(): Generator<PrerenderResource, void, void> {
    // Generate an HTML page at `/my_page/index.html` with this content:
    yield PrerenderResource.fromHtml('/my_page/index.html', renderToHtml(
        <html>
            <head>
                <title>My Page</title>
                <meta charSet="utf8" />
            </head>
            <body>
                <MyComponent name="World" />
            </body>
        </html>
    ));
}
```

```python
# my_page/BUILD.bazel

load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@rules_prerender//:index.bzl", "prerender_pages", "web_resources_devserver")

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
    # Import specifier for the JavaScript output from `:prerender` which
    # generates the page.
    entry_point = "./my_page_prerender.js",
    # Depend on the library containing `my_page_prerender.js`.
    prerender = ":prerender",
)

ts_project(
    name = "prerender",
    srcs = ["my_page_prerender.tsx"],
    deps = [
        # See "Component composition" to learn more about how to depend on
        # another `prerender_component`.
        "//my_component:my_component_prerender",

        # Other dependencies.
        "//:node_modules/@rules_prerender/preact",
        "//:node_modules/preact",
    ],
)

# Small dev server to test out this page. `bazel run` / `ibazel run` this target
# to check out the page at `/my_page/index.html`.
web_resources_devserver(
    name = "devserver",
    resources = ":prerendered_page",
)
```

The `//my_page:prerendered_page` target generates a directory which contains its
HTML, JavaScript, CSS, and other resources from all the transitively included
components at their expected paths.

Multiple `prerender_pages()` directories can then be composed together into a
single `web_resources()` target which contains a final directory of everything
merged together, representing an entire prerendered web site.

This final directory can be served with a simple devserver for local builds or
uploaded directly to a CDN for production deployments.

```python
# my_site/BUILD.bazel

load("@rules_prerender//:index.bzl", "web_resources", "web_resources_devserver")

# Combines all the prerendered resources into a single directory, composing a
# site from a bunch of `prerender_pages()` and `web_resources()` rules. Just
# upload this to a CDN for production builds!
web_resources(
    name = "my_site",
    deps = [
        "//my_page:prerendered_page",
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

### Component composition

The `prerender_component` target generates aliases to the targets passed in as
inputs. Consider the following example:

```python
load("@rules_prerender//:index.bzl", "prerender_component")

prerender_component(
    name = "component",
    prerender = ":my_prerender_lib",
    scripts = ":my_scripts_lib",
    styles = ":my_styles_lib",
    resources = ":my_resources_lib",
)
```

This will generate the following aliases:

*   `:component_prerender` -> `:my_prerender_lib`
*   `:component_scripts` -> `:my_scripts_lib`
*   `:component_styles` -> `:my_styles_lib`
*   `:component_resources` -> `:my_resources_lib`

If you want to use any part of a component, you can use it directly rather than
depending on `:component`. However, you _must_ depend on that part through one
of the above aliases.

For example, consider the following component:

```tsx
// my_component/prerender.mts

import { VNode } from 'preact';

/** Render partial HTML with Preact. */
export function MyComponent({ name }: { name: string }): VNode {
    return <div>Hello, {name}!</div>
}
```

With the following `BUILD.bazel` file:

```python
# my_component/BUILD.bazel

load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@rules_prerender//:index.bzl", "prerender_component")

prerender_component(
    name = "my_component",
    prerender = ":prerender_lib",
    # ...
)

ts_project(
    name = "prerender_lib",
    srcs = ["prerender.mts"],
)
```

To use this, you can import `MyComponent` directly like you would any other
function.

```typescript
// my_other_component/prerender.mts

import { MyComponent } from '../my_component/prerender.js';

// ...
```

However instead of depending on `//my_component:prerender_lib`, depend on
`//my_component:my_component_prerender`.

```python
# my_other_component/BUILD.bazel

load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@rules_prerender//:index.bzl", "prerender_component")

# Does not reference `//my_component` at all.
prerender_component(
    name = "my_other_component",
    prerender = ":prerender_lib",
    # ...
)

ts_project(
    name = "prerender_lib",
    srcs = ["prerender.mts"],
    # IMPORTANT: Depend on `:my_component_prerender` instead of `:prerender_lib`.
    deps = ["//my_component:my_component_prerender"],
)
```

While this looks like just an `alias`, it is
[actually load bearing](/docs/architecture/prerender_component.md) and
_required_.

The same requirement to use the aliases applies to client-side JavaScript
(`_scripts`), CSS styles (`_styles`), and generated resources (`_resources`).

### `prerender_component` rules

As indicated by [component composition](#component-composition), the
`prerender_component` macro is a bit unique compared to most Bazel macros/rules
and has a few special rules for how it is used.

1.  Any direct dependency of a `prerender_component` target should _only_ be
    used by that `prerender_component`.
1.  Any additional desired dependencies should go through the relevant
    `_prerender`, `_scripts`, `_styles`, `_resources` aliases generated by
    `prerender_component`.
    *   Exception: Unit tests may directly depend on targets, provided they do
        _not_ use any `prerender_*` rules as part of the test.
1.  _Never_ depend on a `prerender_component` target directly. Always depend on
    the alias of the specific part of the component you actually want to use.
    *   Exception: You may `bazel build` a `prerender_component` target directly
        or have a `build_test` depend on it in order to verify that the
        component is buildable.
1.  Any direct dependency of a `prerender_component` target *must* be defined in
    the same Bazel package and have private visibility.
    *   This is enforced at build time.
    *   Acts as a guardrail to make it less likely to run afoul of the above
        rules.

A general best practice is to give every `prerender_component` target its own
directory and Bazel package. Leave everything private visibility except for the
`prerender_component` target itself. This will set visibility for the alias
targets as well. Doing so makes it impossible to accidentally forget to use the
component aliases, since doing so would be a visibility error. This pattern
helps you naturally follow the above rules without even thinking about it.

### Generating multiple pages

We can generate multiple pages just as easily as the one. We just need to yield
more files. Take this example where we render HTML files for a bunch of markdown
posts in a blog.

```tsx
// my_blog/posts_prerender.tsx

import * as fs from 'fs';
import * as path from 'path';
import { PrerenderResource, renderToHtml } from '@rules_prerender/preact';
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
        const postMarkdown =
            await fs.readFile(path.join(postsDir, post), 'utf8');
        const postHtml = md.render(postMarkdown);
        const postBaseName = post.split('.').slice(0, -1).join('.');
        const htmlName = `${postBaseName}.html`;
        yield PrerenderResource.fromHtml(`/posts/${htmlName}`, renderToHtml(
            <html>
                <head>
                    <title>Post {postBaseName}</title>
                    <meta charSet="utf8" />
                </head>
                <body>
                    <article dangerouslySetInnerHTML={{ __html: postHtml }} />
                </body>
            </html>
        ));
    }
}
```

We can easily execute this at build time like so:

```python
# my_blog/BUILD.bazel

load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@rules_prerender//:index.bzl", "prerender_pages", "web_resources_devserver")

# Renders a page for every `posts/*.md` file. Also performs all the bundling and
# merging of required JS, CSS, and other resources.
prerender_pages(
    name = "prerendered_posts",
    # Script to invoke the default export of to generate the page.
    entry_point = "./posts_prerender.js",
    # Library which generates the entry point JavaScript.
    prerender = ":prerender",
)

ts_project(
    name = "prerender",
    srcs = ["posts_prerender.tsx"],
    # Include all the markdown files at runtime in runfiles.
    data = glob(["posts/*.md"]),
    deps = [
        "//:node_modules/@types/markdown-it",
        "//:node_modules/@types/node",
        "//:node_modules/rules_prerender",
        "//:node_modules/markdown-it",
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

### Debugging

Since `prerender_pages()` and related rules invoke user code at build time,
debugging can get a little complicated. Add the following to your `.bazelrc`:

```
# `@rules_prerender` specific options.
build --flag_alias=debug_prerender=@rules_prerender//tools/flags:debug_prerender
```

Then, you can use the `--debug_prerender` flag to specify a target which you
want to open a breakpoint on. Use it with:

```shell
bazel run //path/to/my:devserver --debug_prerender=//path/to/my:prerender_pages_target
```

You should then see a log statement indicating that a target is being debugged
and a hung execution on the `Prerendering` action.

```
DEBUG: /home/doug/Source/rules_prerender/packages/rules_prerender/prerender_resources.bzl:165:14: Debugging @//examples/minimal:page_page_annotated from //examples/minimal:page
INFO: Analyzed target //examples/minimal:devserver (1 packages loaded, 5038 targets configured).
INFO: Found 1 target...
[290 / 294] Prerendering (@//examples/minimal:page_page_annotated); 8s linux-sandbox
```

This target is hanging because it has `--inspect-brk` set on the Node invocation
and is waiting for the debugger. Connect your preferred Node debugger and you
should be able to step through rendering.

Note that the Bazel cache can get a little tricky here, as repeated runs may
skip the target altogether. If so, make any arbitrary whitespace change to a the
rendering code to invalidate the cache and rerun.

The target you actually `bazel run` or `bazel build` (`//path/to/my:devserver`
above) doesn't actually matter, as long as it includes
`//path/to/my:prerender_pages_target` as a transitive dependency.

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
bazel run @pnpm -- install --dir $PWD --frozen-lockfile
bazel test //...
```

Prefer using `bazel run @pnpm -- ...` and
`bazel run @nodejs_host//:node -- ...` over using `pnpm` and `node` directly so
they are strongly versioned with the repository. Alternatively, you can install
[`nvm`](https://github.com/nvm-sh/nvm) and run `nvm use` to switch the `node`
version to the correct one for this repository.

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
`npm test` also tests external workspaces used as test cases which would
normally be skipped by `bazel test //...`.

## Testing

Most tests are run in [Jasmine](https://jasmine.github.io/) using
`jasmine_node_test()`, a
[slightly customized implementation of `@aspect_rules_jasmine`](/tools/jasmine/jasmine_node_test.bzl).
These tests run in a Node Jasmine environment with no available browser (unless
they depend on WebDriverIO). The test can be executed with a simple
`bazel test //path/to/pkg:target`.

### Debugging Tests

To debug these tests, simply add `--config debug`, which will opt in to
additional flags specifically for testing. Most notably, this includes
`--inspect-brk` so Node will not begin executing until a debugger has connected.
You can use `chrome://inspect` or the "Attach" run configuration in VSCode to
attach a debugger and start test execution.

### Debugging WebDriver tests

End-to-end tests using a real browser are done with WebDriver using
[`jasmine_web_test_suite()`](./tools/jasmine/jasmine_web_test_suite.bzl).

When executing WebDriver tests and using `--config debug`, the browser will open
non-headless, giving you the opportunity to visually inspect the page under test
and debug it directly. This is done via an X server, so make sure the `$DISPLAY`
variable is set. For example, if debugging over SSH, you'll need to enable X11
forwarding.

When using [WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install-win10)
make sure you have also installed [WSLg](https://github.com/microsoft/wslg).
That will give you the X server implementation necessary to debug.

Then running a `bazel test //path/to/pkg:target --config debug` for a WebDriver
test should open Chrome visually and give you an opportunity to debug and
inspect the page.

### Mocking

Most model types are stored under [//common/models/...](/common/models/) and
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
