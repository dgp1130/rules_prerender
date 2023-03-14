"""Defines `prerender_pages()` functionality."""

load(":multi_inject_resources.bzl", "multi_inject_resources")
load(":prerender_pages_unbundled2.bzl", "prerender_pages_unbundled")
load(":scripts_bundle.bzl", "scripts_bundle")
load(":web_resources.bzl", "web_resources")

visibility("public")

def prerender_pages(
    name,
    entry_point,
    prerender,
    scripts = None,
    styles = None,
    resources = None,
    bundle_js = True,
    testonly = None,
    visibility = None,
    debug_target = None,
):
    """Renders multiple resources at build time and bundles client-side content.

    This provides a higher-level implementation of `prerender_pages_unbundled`,
    automatically bundling client-side resources.

    This invokes the default export function of the given `entry_point` and
    generates a directory of files with the result.

    The file listed in `entry_point` must compile to an ESM module with a
    default export of the type:
    
    ```
    () => Iterable<PrerenderResource> | Promise<Iterable<PrerenderResource>>
        | AsyncIterable<PrerenderResource>
    ```

    Note: You may want to write this using the `Generator` or `AsyncGenerator`
    types, as they are allowed subtypes and will enable TypeScript to catch some
    foot-guns with `return` and `yield` that come with generators.

    ```typescript
    export default function*(): Generator<PrerenderResource, void, void> {
        // ...
    }

    // OR

    export default async function*():
            AsyncGenerator<PrerenderResource, void, void> {
        // ...
    }
    ```

    Any scripts on each page that are included with `includeScript()` are
    bundled together into a single JavaScript file and inserted into that page
    as a `<script />` tag.

    Any styles that are included with `inlineStyle()` are inlined as a
    `<style />` tag at the inserted location in the document.
    
    Outputs:
        %{name}: A `web_resources()`-compatible rule which includes all the
            prerendered files, with all HTML files injected with `<script />`
            and `<style />` tags, each with a JavaScript file including all
            transitive sources bundled together, and all transitive resources
            included. CSS is inlined directly in the HTML documents in a
            `<style />` tag. Non-HTML files are included as well, but not
            modified in the bundling process.
    
    Args:
        name: The name of this rule.
        entry_point: The JavaScript file to invoke as the entry point of the
            binary.
        prerender: Passed through to `prerender_pages_unbundled()`.
        scripts: Passed through to `prerender_pages_unbundled()`.
        styles: Passed through to `prerender_pages_unbundled()`.
        resources: Passed through to `prerender_pages_unbundled()`.
        bundle_js: Whether or not to bundle and inject JavaScript files.
            Defaults to `True`.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        visibility: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        debug_target: The label to check
            `@rules_prerender//tools/flags:debug_prerender` for. If the flag is
            set to this label, then the renderer binary with open a debugger for
            local debugging. Defaults to this target's label. Useful for
            providing intuitive flag behavior in macros.
    """
    # Render the site and collect all the scripts/styles/resources together.
    prerender_name = "%s_unbundled" % name
    prerender_pages_unbundled(
        name = prerender_name,
        entry_point = entry_point,
        prerender = prerender,
        scripts = scripts,
        styles = styles,
        resources = resources,
        testonly = testonly,
        visibility = visibility,
        debug_target = debug_target or "//%s:%s" % (native.package_name(), name),
    )

    bundle = "%s_bundle" % name
    if bundle_js:
        # Bundle all client-side scripts in a `TreeArtifact` at `%{name}_bundle`.
        scripts_bundle(
            name = bundle,
            entry_points = ":%s_scripts_entries" % prerender_name,
            testonly = testonly,
            deps = [":%s_scripts" % prerender_name],
        )

    # Inject bundled JS and CSS into the HTML.
    injected_dir = "%s_injected" % name
    multi_inject_resources(
        name = injected_dir,
        input_dir = ":%s" % prerender_name,
        bundles = ":%s" % bundle if bundle_js else None,
        styles = ":%s_styles" % prerender_name,
        testonly = testonly,
    )

    # Output a resources directory of the HTML, bundled JavaScript, and any
    # resource dependencies.
    web_resources(
        name = name,
        testonly = testonly,
        visibility = visibility,
        deps = [
            ":%s" % injected_dir,
            ":%s_resources" % prerender_name,
        ],
    )
