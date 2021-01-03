"""Defines `prerender_page_bundled()` functionality."""

load("@build_bazel_rules_postcss//:index.bzl", "postcss_binary")
load("@npm//@bazel/rollup:index.bzl", "rollup_bundle")
load(":postcss_import_plugin.bzl", IMPORT_PLUGIN_CONFIG = "PLUGIN_CONFIG")
load(":prerender_page.bzl", "prerender_page")
load(":inject_resources.bzl", "inject_resources")

def prerender_page_bundled(
    name,
    src,
    lib_deps = [],
    scripts = [],
    styles = [],
    deps = [],
    bundle_js = True,
    bundle_css = True,
    testonly = None,
    visibility = None,
):
    """Renders an HTML page at build time and bundles client-side scripts.

    This provides a higher-level implementation of `prerender_page`,
    automatically bundling client-side scripts.

    This invokes the default export function of the given `src` TypeScript,
    expecting a `string` (or `Promise<string>`) returned and generates an HTML
    file with that content.

    `src` must compile to a CommonJS module with a default export that is a
    function which accepts no arguments and returns a `string` or a
    `Promise<string>`. A `ts_library()` is used to generate this and `lib_deps`
    is used as the `deps` parameter.

    Any scripts that are included with `includeScript()` are bundled together
    into a single JavaScript file and inserted into the final HTML document as a
    `<script />` tag.
    
    Outputs:
        %{name}.html: An HTML file containing the content returned by the `src`
            file. Also includes a `<script />` tag which loads
            `/%{name}_bundle.js`.
        %{name}_bundle.js: A bundled JavaScript file including all scripts
            provided to `includeScript()` during rendering of the page and its
            components. Scripts are de-duplicated and can import each other like
            normal modules. Unused scripts are tree-shaken.
        %{name}_styles.css: A bundled CSS file including all styles provided to
            `includeStyle()` during rendering of the page and its components.
            Styles are de-duplicated and can import each other. Unused styles
            are tree-shaken.
    
    Args:
        name: The name of this rule.
        src: The TypeScript source file with a default export that returns a
            string which contains the HTML document.
        lib_deps: Dependencies for the TypeScript source file.
        scripts: List of client-side JavaScript libraries to be bundled for the
            generated page.
        styles: List of CSS files or `filegroup()`s of CSS files which can be
            included in the prerendered HTML.
        deps: `prerender_component()` dependencies for this page.
        bundle_js: Whether or not to bundle and inject JavaScript files.
            Defaults to `True`.
        bundle_css: Whether or not to bundle and inject CSS files. Defaults to
            `True`.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        visibility: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    """
    # Render the HTML page at `%{name}_page.html`.
    prerender_name = "%s_page" % name
    prerender_page(
        name = prerender_name,
        src = src,
        lib_deps = lib_deps,
        scripts = scripts,
        styles = styles,
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
                "//packages/rules_prerender:postcss_import_plugin": IMPORT_PLUGIN_CONFIG,
            },
            deps = [":%s_styles" % prerender_name],
        )

    # Inject bundled JS and CSS into the HTML and move it to `%{name}.html`.
    output_html = "%s.html" % name
    scripts_to_inject = ["/%s.js" % bundle] if bundle_js else []
    styles_to_inject = [bundled_css] if bundle_css else []
    inject_resources(
        name = "%s_inject" % name,
        input = "%s.html" % prerender_name,
        output = output_html,
        scripts = scripts_to_inject,
        styles = styles_to_inject,
    )

    # Export only the two resulting files.
    outputs = [output_html] + ["%s.js" % bundle] if bundle_js else []
    native.filegroup(
        name = name,
        srcs = outputs,
    )
