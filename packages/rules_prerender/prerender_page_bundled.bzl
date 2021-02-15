"""Defines `prerender_page_bundled()` functionality."""

load("@npm//@bazel/postcss:index.bzl", "postcss_binary")
load("@npm//@bazel/rollup:index.bzl", "rollup_bundle")
load(":postcss_import_plugin.bzl", IMPORT_PLUGIN_CONFIG = "PLUGIN_CONFIG")
load(":prerender_page.bzl", "prerender_page")
load(":inject_resources.bzl", "inject_resources")
load(":web_resources.bzl", "web_resources")

def prerender_page_bundled(
    name,
    src,
    path = None,
    tsconfig = None,
    lib_deps = [],
    scripts = [],
    styles = [],
    resources = [],
    deps = [],
    bundle_js = True,
    bundle_css = True,
    testonly = None,
    visibility = None,
):
    """Renders an HTML page at build time and bundles client-side resources.

    This provides a higher-level implementation of `prerender_page`,
    automatically bundling client-side resources.

    This invokes the default export function of the given `src` TypeScript,
    and generates an HTML file with that content.

    The file listed in `src` must compile to a CommonJS module with a default
    export of the type: `() => string | Promise<string>`. A `ts_library()` is
    used to compile the `src` file and `lib_deps` + `deps` is used as the `deps`
    parameter with the given `tsconfig`.

    Any scripts that are included with `includeScript()` are bundled together
    into a single JavaScript file and inserted into the final HTML document as a
    `<script />` tag.

    Any styles that are included with `includeStyle()` are bundled together into
    a single CSS file and inserted into the final HTML document as an inline
    `<style />` tag.
    
    Outputs:
        %{name}: A `web_resources()`-compatible rule which includes the
            prerendered HTML file with injected `<script />` and `<style />`
            tags, a JavaScript file with all the transitive sources bundled
            together, and all transitive resources included. CSS is inlined
            directly in the HTML document in a `<style />` tag.
    
    Args:
        name: The name of this rule.
        src: The TypeScript source file with a default export which generates
            the HTML document.
        path: The path the page is hosted at. Must start with a slash and
            defaults to `%{name}.html`.
        tsconfig: A label referencing a tsconfig.json file or `ts_config()`
            target. Will be used to compile the `src` file.
        lib_deps: Dependencies for the TypeScript source file.
        scripts: List of client-side JavaScript libraries to be bundled with the
            generated page.
        styles: List of CSS files or `filegroup()`s to inject into the
            prerendered HTML file.
        resources: List of `web_resources()` rules required by the page at
            runtime.
        deps: `prerender_component()` dependencies for the generated page.
        bundle_js: Whether or not to bundle and inject JavaScript files.
            Defaults to `True`.
        bundle_css: Whether or not to bundle and inject CSS files. Defaults to
            `True`.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        visibility: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    """
    path = path or "/%s.html" % name

    # Render the HTML page at `%{name}_page.html`.
    prerender_name = "%s_page" % name
    prerender_page(
        name = prerender_name,
        src = src,
        tsconfig = tsconfig,
        lib_deps = lib_deps,
        scripts = scripts,
        styles = styles,
        resources = resources,
        deps = deps,
        testonly = testonly,
        visibility = visibility,
    )

    bundle = "%s_bundle" % name
    if bundle_js:
        # Bundle all client-side scripts at `%{name}_bundle.js`.
        rollup_bundle(
            name = bundle,
            entry_point = ":%s_scripts.ts" % prerender_name,
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

    # Inject bundled JS and CSS into the HTML and move it to `%{name}.html`.
    output_html = "%s.html" % name
    js_path = ".".join(path.split(".")[:-1]) + ".js"
    scripts_to_inject = [js_path] if bundle_js else []
    styles_to_inject = [bundled_css] if bundle_css else []
    inject_resources(
        name = "%s_inject" % name,
        input = "%s.html" % prerender_name,
        output = output_html,
        scripts = scripts_to_inject,
        styles = styles_to_inject,
        testonly = testonly,
    )

    # Output a resources directory of the HTML, bundled JavaScript, and any
    # resource dependencies.
    entries = {path: output_html}
    if bundle_js:
        entries[js_path] = "%s.js" % bundle
    web_resources(
        name = name,
        entries = entries,
        testonly = testonly,
        visibility = visibility,
        deps = [":%s_resources" % prerender_name],
    )
