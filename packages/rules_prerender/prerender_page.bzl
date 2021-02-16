"""Defines `prerender_page()` functionality."""

load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")
load("@npm//@bazel/typescript:index.bzl", "ts_library")
load("//packages/renderer:build_vars.bzl", "RENDERER_RUNTIME_DEPS")
load(":entry_points.bzl", "script_entry_point", "style_entry_point")
load(":prerender_component.bzl", "prerender_component")
load(":web_resources.bzl", "web_resources")

def prerender_page(
    name,
    src,
    tsconfig = None,
    data = [],
    lib_deps = [],
    scripts = [],
    styles = [],
    resources = [],
    deps = [],
    testonly = None,
    visibility = None,
):
    """Renders an HTML page with the given TypeScript source at build time.

    This invokes the default export function of the given `src` TypeScript,
    and generates an HTML file with the returned content.

    The file listed in `src` must compile to a CommonJS module with a default
    export of the type: `() => string | Promise<string>`. A `ts_library()` is
    used to compile the `src` file and `lib_deps` + `deps` is used as the `deps`
    parameter with the given `tsconfig`.

    Outputs:
        %{name}.html: An HTML file containing the content returned by the `src`
            file.
        %{name}_scripts: A `ts_library()` rule containing all the client-side
            scripts used by the page. This includes a generated file
            `%{name}_scripts.ts` which acts as an entry point, importing all
            scripts that were included in the page via `includeScript()`.
        %{name}_styles: A `filegroup()` containing all the CSS styles used by
            the page.
        %{name}_resources: A `web_resources()` target containing all the
            transitively used resources.
    
    Args:
        name: The name of this rule.
        src: The TypeScript source file with a defualt export which generates 
            the HTML document.
        tsconfig: A label referencing a tsconfig.json file or `ts_config()`
            target. Will be used to compile the `src` file.
        data: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        lib_deps: Dependencies for the TypeScript source file.
        scripts: List of client-side JavaScript libraries to be included with
            the generated page.
        styles: List of CSS files or `filegroup()`s to included with the
            prerendered HTML file.
        resources: List of `web_resources()` rules required by the page at
            runtime.
        deps: `prerender_component()` dependencies for the generated page.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        visibility: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    """
    # Generate a component of the user's code.
    component = "%s_component" % name
    prerender_component(
        name = component,
        srcs = [src],
        tsconfig = tsconfig,
        data = data,
        lib_deps = lib_deps,
        scripts = scripts,
        styles = styles,
        resources = resources,
        deps = deps,
        testonly = testonly,
    )
    component_prerender = "%s_prerender" % component
    component_scripts = "%s_scripts" % component
    component_styles = "%s_styles" % component
    component_resources = "%s_resources" % component

    # Get the generated JS file path for the user provided TypeScript source.
    prerender_js = "%s_prerender_js" % name
    native.filegroup(
        name = prerender_js,
        srcs = [":%s" % component_prerender],
        testonly = testonly,
        output_group = "es5_sources",
    )

    # Create a binary to execute the runner script.
    binary = "%s_binary" % name
    nodejs_binary(
        name = binary,
        entry_point = "//packages/renderer:renderer_js",
        templated_args = ["--bazel_patch_module_resolver"],
        testonly = testonly,
        data = RENDERER_RUNTIME_DEPS + [
            ":%s" % component_prerender,
            "//tools/internal:renderer",
        ],
    )

    # Execute the runner to generate an output HTML page.
    annotated_page = "%s_annotated" % name
    _prerender_page_rule(
        name = annotated_page,
        entry_point = ":%s" % prerender_js,
        renderer = ":%s" % binary,
        testonly = testonly,
    )

    # Extract annotations and generate metadata from them.
    extracted_page = "%s.html" % name
    metadata = "%s_metadata.json" % name
    _extract_annotations(
        name = "%s_annotation_extractor" % name,
        annotated_page = annotated_page,
        output_page = extracted_page,
        output_metadata = metadata,
        testonly = testonly,
    )

    # Export only the extracted HTML file to users at `%{name}`.
    native.filegroup(
        name = name,
        srcs = ["%s.html" % name],
        testonly = testonly,
        visibility = visibility,
    )

    # Generate the entry point importing all included scripts.
    client_scripts = "%s_scripts" % name
    script_entry = "%s.ts" % client_scripts
    script_entry_point(
        name = "%s_entry" % client_scripts,
        metadata = metadata,
        output_entry_point = script_entry,
        testonly = testonly,
    )

    # Reexport all included scripts at `%{name}_scripts`.
    ts_library(
        name = client_scripts,
        srcs = [script_entry],
        deps = [":%s" % component_scripts],
        testonly = testonly,
        visibility = visibility,
    )

    # Generate the entry point importing all included styles.
    client_styles = "%s_styles" % name
    style_entry = "%s.css" % client_styles
    style_entry_point(
        name = "%s_entry" % client_styles,
        metadata = metadata,
        output_entry_point = style_entry,
        testonly = testonly,
    )

    # Reexport all included styles at `%{name}_styles`.
    native.filegroup(
        name = client_styles,
        srcs = [
            style_entry,
            ":%s" % component_styles,
        ],
        testonly = testonly,
        visibility = visibility,
    )

    # Reexport all transitive resources at `%{name}_resources`.
    output_resources = "%s_resources" % name
    web_resources(
        name = output_resources,
        deps = [component_resources],
        testonly = testonly,
        visibility = visibility,
    )

def _prerender_page_impl(ctx):
    # Invoke the renderer and output the content.
    ctx.actions.run(
        mnemonic = "Prerender",
        progress_message = "Prerendering page",
        executable = ctx.executable.renderer,
        arguments = [
            "--entry-point", "%s/%s" % (
                ctx.workspace_name,
                ctx.file.entry_point.short_path,
            ),
            "--output", ctx.outputs.output.path,
        ],
        inputs = [ctx.file.entry_point],
        outputs = [ctx.outputs.output],
    )

_prerender_page_rule = rule(
    implementation = _prerender_page_impl,
    attrs = {
        "entry_point": attr.label(
            mandatory = True,
            allow_single_file = True,
        ),
        "renderer": attr.label(
            mandatory = True,
            executable = True,
            cfg = "exec",
        ),
    },
    outputs = {
        "output": "%{name}.html",
    },
    doc = """
        Executes the given `renderer` binary with an `--entry-point` provided as
        a JavaScript file that renders the page as a string.
    """,
)

def _extract_annotations(
    name,
    annotated_page,
    output_page,
    output_metadata,
    testonly = None,
):
    """Extracts annotations from the provided HTML.
    
    Args:
        name: The name of the rule.
        annotated_page: An annotated HTML page to extract from.
        output_page: The file to write the output HTML to. This will be the
            input HTML page except with all annotations removed.
        output_metadata: The file to write the output metadata JSON which is
            generated from the annotations extracted from the input HTML file.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    """
    native.genrule(
        name = name,
        srcs = [annotated_page],
        outs = [
            output_page,
            output_metadata,
        ],
        cmd = """
            $(location //tools/internal:annotation_extractor) \\
                --input-html $(location {annotated_page}) \\
                --output-html $(location {output_html}) \\
                --output-metadata $(location {output_metadata})
        """.format(
            annotated_page = annotated_page,
            output_html = output_page,
            output_metadata = output_metadata,
        ),
        testonly = testonly,
        tools = ["//tools/internal:annotation_extractor"],
    )
