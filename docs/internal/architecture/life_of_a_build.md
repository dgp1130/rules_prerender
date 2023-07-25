# Life of a Build

`@rules_prerender` is a complex toolchain which does a lot of build-time
processing. This document describes everything which happens in a `bazel build`
command, what the timeline of actions are, where those actions live, and what
the intermediate data looks like.

## Scope

There are three primary macros with distinct responsibilities in this process:
*   [`prerender_component`](/packages/rules_prerender/prerender_component.bzl) -
    Encapsulates all the different resources required in a component.
    *   See [`prerender_component` Architecture](./prerender_component.md) for a
        breakdown of how that particular macro works.
*   [`prerender_pages_unbundled`](/packages/rules_prerender/prerender_pages_unbundled.bzl) -
    Invokes user code to render the HTML and collects all the client-side
    JavaScript, CSS styles, and generated resources from upstream
    `prerender_component` targets.
*   [`prerender_pages`](/packages/rules_prerender/prerender_pages.bzl) - Wraps
    `prerender_pages_unbundled` to achieve the same goals, _but also_ bundles
    the JavaScript, CSS, and resources together into a single output directory.

This document covers everything happening under the hood of a `prerender_pages`
target. This covers the vast majority of the build process owned by
`@rules_prerender`.

## Gathering metadata

The first thing which needs to happen is to collect and identify the prerender
JavaScript, client-side JavaScript, CSS styles, and generated resources which
will be needed. The prerender JavaScript is easiest because it comes from the
`prerender` attribute of the `prerender_pages` macro. This is a `ts_project` or
`js_library` and `@aspect_rules_js` handles all the complexity there with
nothing unique for `@rules_prerender`.

Finding the rest of the "slices" of a component in the transitive closure are
more complicated. There are no clear dependency paths from a `prerender_pages`
target to all slices of the transitive `prerender_component` targets. However,
`prerender_component` generates a `PrerenderMetadataInfo` provider which
captures all the providers from its slices. See  See
[`prerender_component` Architecture](./prerender_component.md) for more info
there.

For `prerender_pages` (really `prerender_pages_unbundled`) to find these
metadata providers, it uses [an aspect](https://bazel.build/extending/aspects)
which walks its transitive dependencies and looks for `PrerenderMetadataInfo`
providers.

After collecting all the `PrerenderMetadataInfo` providers, it extracts all the
client-side scripts, CSS styles, and generated resources for all components into
distinct targets. This gives it a superset of all possibly-referenced files in
the compilation.

## Rendering

`prerender_pages_unbundled` and `prerender_resources` both generate a
`js_binary` under the hood and invoke it at build time. The actual rendering
process is relatively straightforward. It performs a default import of the
user's specified `entry_point`, generates a
[`TreeArtifact`](https://bazel.build/reference/glossary#tree-artifact), and then
writes each output file to the specified relative location in the tree.

[`includeScript`](/packages/rules_prerender/scripts.mts) and
[`inlineStyle`](/packages/rules_prerender/styles.mts) calls do not do anything
special at render time. Instead they print out HTML "annotations" into the
rendered document.

For example the following renders:

```typescript
// my_app/site.mts

yield PrerenderResource.of('/index.html', `
${includeScript('./script.mjs', import.meta)}

${inlineStyle('./style.mjs', import.meta)}
`.trim());
```

```xml
<rules_prerender:annotation>
{
    "type": "script",
    "path": "./my_app/script.mjs"
}
</rules_prerender:annotation>

<rules_prerender:annotation>
{
    "type": "style",
    "path": "./my_app/location_from_css_import_map/style.css"
}
</rules_prerender:annotation>
```

`import.meta` is used to resolve paths like `./` relative to the current source
file. CSS files are resolved through the import map, but
[more on that later](#css-import-map).

### Annotation extraction

After the page is rendered, the "annotations" are extracted to create a
`metadata.json` file (not to be confused with `PrerenderMetadataInfo`). This
removes the extra nodes from the page and converts them into a more usable JSON
structure. This looks like:

```jsonc
{
    "includedScripts": {
        // Scripts included by the `/index.html` page.
        "/dir/index.html": [
            // Path to an included script.
            { "path": "./my_app/script.mjs" },
            // Path to another included script.
            { "path": "./my_app/another_script.mjs" }
        ]
    }
}
```

Note that CSS files are actually _not_ included in this extraction process. This
is because CSS is bundled at the component-level, not the page-level so it can
work with declarative shadow DOM. As a result, annotation extraction actually
leaves CSS annotations in the page to be processed later. `metadata.json`
exclusively contains JavaScript references.

With the mapping in the `metadata.json` file, the build system now can correlate
a generated HTML file with the client-side JavaScript that it requires.
`prerender_pages_unbundled` next generates a script entry point for each
generated HTML file. This entry point performs a side effectful import of each
loaded script. The entry point uses the same relative path as the HTML file in
the output `TreeArtifact`. In this case, we would generate a directory with a
single `/dir/index.js` file with the contents:

```javascript
// Note the amount of `../` necessary is somewhat arbitrary, don't think about
// it too hard.
import '../../my_app/script.mjs';
import '../../my_app/another_script.mjs';
```

This entry point loads all the scripts necessary for the page as side-effectful
imports.

## Bundling

The final step is to bundle the whole application together and drop any unused
resources. This is mostly handled by
[`prerender_pages`](/packages/rules_prerender/prerender_pages.bzl).

### Client-side JavaScript

The directory of JavaScript entry points is processed by Rollup to bundle all
the JavaScript, apply code splitting, and run dead code elimination. Any files
not loaded with `includeScript` will not be imported by the entry points and
therefore will be dropped from the bundle as expected.

This is output as yet another `TreeArtifact`, with an entry point for each page
plus any chunks shared by multiple entry points.

```
page_bundle/
└── dir/
    └── index.js
└── shared-abc123.js
```

### Styles

Styles are bundled different from JavaScript because they are loaded differently
in the page. All the JavaScript required on is bundled in advance and loaded via
a single `<script>` tag. Styles do not have that luxury.

Due to the way declarative shadow DOM works, every component instance _must_
duplicate its styles.

```html
<!-- Render `my-component`. -->
<my-component>
    <template shadowrootmode="open">
        <style>/* Styles go here. */</style>
        <div>Hello, World!</div>
    </template>
</my-component>

<!-- Render `my-component` again. -->
<my-component>
    <template shadowrootmode="open">
        <style>/* Styles need to be duplicated here, no way to share. */</style>
        <div>Hello, World!</div>
    </template>
</my-component>
```

The alternative is to use a `<link rel="stylesheet">`, however this incurs an
extra network request and causes a flash of unstyled content (FOUC) which is
often undesirable. Compression helps a lot with duplication here, but there is
wasted effort for sure. https://github.com/WICG/webcomponents/issues/939 tracks
the platform feature needed here.

As a result of this design, we can't assume that every page will have a single
bundled stylesheet and need to treat bundling differently. Instead, each
`prerender_component` bundles its stylesheets. Doing this at the component-level
means that each CSS file available to inline in a component gets its own full
bundle. This means shared styles can be duplicated across different bundles in
different components, but that is necessary for how declarative shadow DOM
works.

#### CSS import map

A tricky side challenge is that a user might author a `./styles.css` file, and
they expect to be able to run `inlineStyle('./styles.css', import.meta)`. This
is fundamentally wrong however, because `styles.css` refers to the _source file_
the user authored, not the _bundled_ CSS file which inlines all imports in
`styles.css`. Bazel requires that generated files have unique names, so we
cannot call the bundled CSS file `styles.css`.

Instead, every `prerender_component` generates a
[`css_binaries`](/packages/rules_prerender/css/css_binaries.bzl) target for the
input `css_library`. This `css_binaries` generates a subdirectory of CSS files,
where each file is the bundled version of the direct sources in the
`css_library`. These are files available for `inlineStyle` to use.

Unfortunately those files are in the wrong location, `./styles.css` would not
resolve to them, and users would actually have to write something like
`inlineStyle('./component_css_bundle/path/to/pkg/styles.css', import.meta)`.

To avoid this, the `css_bundle` rule generates a
[`CssImportMapInfo`](/packages/rules_prerender/css/css_providers.bzl) provider.
This provider stores a map of the CSS source file path to its associated bundled
location on disk. This allows users to inline `./styles.css` and then the
renderer looks up this map in `inlineStyle` and resolves it to the real
location. The result of the map lookup is rendered to the annotation written to
the HTML file.

## Injection

Finally once all the JavaScript and CSS files are bundled, they are "injected"
into the rendered HTML. JavaScript files are injected as a single tag into their
associated HTML file:

```html
<script src="/dir/index.js" type="module"></script>
```

Since we do not have a single bundle for CSS files, we need to inject each
rendered component's CSS individually. To do this we look for the remaining
`<rules_prerender:annotation>` tags with `type: 'css'` (recall that they were
_not_ removed from the rendered page). Each annotation contains the file path of
the bundled CSS they require. So the injection process reads that file and
replaces the annotation with an inline `<style>` tag at that location. This
ensures each component gets the correct CSS file written to the correct
location.

The last step is to also include transitive resources from `web_resources`
targets. No processing is done on resources, they are merely copied to the
output directory at the same relative file paths.

With that, `prerender_pages` outputs the final directory as a `web_resources`
target (basically just a `TreeArtifact`). Users can `bazel build` the
`prerender_pages` directly, or pass it to a `web_resources_devserver` to view
the site.
