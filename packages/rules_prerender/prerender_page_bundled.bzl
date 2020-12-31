"""TODO"""

load("@npm//@bazel/rollup:index.bzl", "rollup_bundle")
load(":prerender_page.bzl", "prerender_page")
load(":inject_resources.bzl", "inject_resources")

def prerender_page_bundled(
    name,
    src,
    lib_deps = [],
    scripts = [],
    deps = [],
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
    
    Args:
        name: The name of this rule.
        src: The TypeScript source file with a default export that returns a
            string which contains the HTML document.
        lib_deps: Dependencies for the TypeScript source file.
        scripts: List of client-side JavaScript libraries to be bundled for the
            generated page.
        deps: `prerender_component()` dependencies for this page.
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
        deps = deps,
        testonly = testonly,
        visibility = visibility,
    )

    # Bundle all client-side scripts at `%{name}_bundle.js`.
    bundle = "%s_bundle" % name
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

    # Inject `<script />` tag into the HTML and move it to `%{name}.html`.
    output_html = "%s.html" % name
    inject_resources(
        name = "%s_inject" % name,
        input = "%s.html" % prerender_name,
        output = output_html,
        scripts = ["/%s.js" % bundle],
    )

    # Export only the two resulting files.
    native.filegroup(
        name = name,
        srcs = [
            output_html,
            "%s.js" % bundle,
        ],
    )
