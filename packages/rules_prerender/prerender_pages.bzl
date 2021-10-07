"""Defines `prerender_pages()` functionality."""

load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")
load(
    "@build_bazel_rules_nodejs//:providers.bzl",
    "JSEcmaScriptModuleInfo",
    "JSModuleInfo",
)
load("@npm//@bazel/postcss:index.bzl", "postcss_binary")
load("@npm//@bazel/rollup:index.bzl", "rollup_bundle")
load(":multi_inject_resources.bzl", "multi_inject_resources")
load(":postcss_import_plugin.bzl", IMPORT_PLUGIN_CONFIG = "PLUGIN_CONFIG")
load(":prerender_pages_unbundled.bzl", "prerender_pages_unbundled")
load(":web_resources.bzl", "web_resources")

def prerender_pages(
    name,
    src,
    tsconfig = None,
    data = [],
    lib_deps = [],
    scripts = [],
    styles = [],
    resources = [],
    ssr = [],
    deps = [],
    bundle_js = True,
    bundle_css = True,
    testonly = None,
    visibility = None,
):
    """Renders multiple resources at build time and bundles client-side resources.

    This provides a higher-level implementation of `prerender_pages_unbundled`,
    automatically bundling client-side resources.

    This invokes the default export function of the given `src` TypeScript, and
    generates a directory of HTML files and other prerendered resources.

    The file listed in `src` must compile to a CommonJS module with a default
    export of the type:
    
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

    A `ts_library()` is used to compile the `src` file and `lib_deps` + `deps`
    is used as the `deps` parameter with the given `tsconfig`.

    Any scripts that are included with `includeScript()` are bundled together
    into a single JavaScript file and inserted into **all** the generated HTML
    documents as a `<script />` tag.

    Any styles that are included with `includeStyle()` are bundled together into
    a single CSS file and inserted into **all** the generated HTML documents as
    an inline `<style />` tag.
    
    Outputs:
        %{name}: A `web_resources()`-compatible rule which includes all the
            prerendered files, with all HTML files injected with `<script />`
            and `<style />` tags, each with a JavaScript file including all
            transitive sources bundled together, and all transitive resources
            included. CSS is inlined directly in the HTML documents in a
            `<style />` tag. Non-HTML files are included as well, but not
            modified.
        %{name}_prerender_for_test: An alias to the `ts_library()` target which
            compiles the `src` of this macro marked as `testonly`. This provides
            a simple hook for unit testing prerender logic.
    
    Args:
        name: The name of this rule.
        src: The TypeScript source file with a default export that returns a
            string which contains the HTML document.
        tsconfig: A label referencing a tsconfig.json file or `ts_config()`
            target. Will be used to compile the `src` file.
        data: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        lib_deps: Dependencies for the TypeScript source file.
        scripts: List of client-side JavaScript libraries to be bundled with the
            generated pages.
        styles: List of CSS files or `filegroup()`s to inject into the
            prerendered HTML files.
        resources: List of `web_resources()` rules required by the pages at
            runtime.
        ssr: TODO
        deps: `prerender_component()` dependencies for the generated pages.
        bundle_js: Whether or not to bundle and inject JavaScript files.
            Defaults to `True`.
        bundle_css: Whether or not to bundle and inject CSS files. Defaults to
            `True`.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        visibility: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    """
    # Render the HTML page at `%{name}_page.html`.
    prerender_name = "%s_page" % name
    prerender_pages_unbundled(
        name = prerender_name,
        src = src,
        tsconfig = tsconfig,
        data = data,
        lib_deps = lib_deps,
        scripts = scripts,
        styles = styles,
        resources = resources,
        ssr = ssr,
        deps = deps,
        testonly = testonly,
        visibility = visibility,
    )

    native.alias(
        name = "%s_prerender_for_test" % name,
        actual = ":%s_prerender_for_test" % prerender_name,
        testonly = True,
    )

    bundle = "%s_bundle" % name
    if bundle_js:
        # Bundle all client-side scripts at `%{name}_bundle.js`.
        rollup_bundle(
            name = bundle,
            entry_point = ":%s_scripts.js" % prerender_name,
            config_file = "//packages/rules_prerender:rollup-default.config.js",
            link_workspace_root = True,
            silent = True,
            testonly = testonly,
            deps = [
                ":%s_scripts" % prerender_name,
                "@npm//@rollup/plugin-node-resolve",
            ],
        )

    bundled_css = "%s_styles_bundled.css" % name
    if bundle_css:
        # Bundle all styles.
        postcss_binary(
            name = "%s_styles" % name,
            src = ":%s_styles.css" % prerender_name,
            sourcemap = True,
            output_name = bundled_css,
            plugins = {
                "//tools/internal:postcss_import_plugin": IMPORT_PLUGIN_CONFIG,
            },
            testonly = testonly,
            deps = [":%s_styles" % prerender_name],
        )

    # Inject bundled JS and CSS into the HTML.
    injected_dir = "%s_injected" % name
    multi_inject_resources(
        name = injected_dir,
        input_dir = ":%s" % prerender_name,
        bundle = ":%s" % bundle if bundle_js else None,
        styles = [bundled_css] if bundle_css else [],
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

    native.genrule(
        name = "%s_server_entry_point" % name,
        srcs = [],
        outs = ["%s_server.js" % name],
        cmd = """
            echo "const {{ runfiles }} = require('@bazel/runfiles');" >> $@
            echo "require('rules_prerender/{package}/{prerender_name}_ssr.js');" >> $@
            echo "const {{ main }} = require('rules_prerender/packages/express/host');" >> $@
            echo "" >> $@
            echo "main(runfiles.resolvePackageRelative('{name}'));" >> $@
        """.format(
            package = native.package_name(),
            name = name,
            prerender_name = prerender_name
        ),
        testonly = testonly,
    )

    nodejs_binary(
        name = "%s_server" % name,
        entry_point = "%s_server.js" % name,
        data = [
            ":%s" % name, # Application files to serve.
            ":%s_ssr" % prerender_name, # Prerender library.
            # Include dependencies for entry point.
            "//packages/express:host",
            "@npm//@bazel/runfiles",
        ],
        templated_args = ["--bazel_patch_module_resolver"],
        testonly = testonly,
        visibility = visibility,
    )
