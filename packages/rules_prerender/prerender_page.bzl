"""Defines `prerender_page()` functionality."""

load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")
load("@npm//@bazel/typescript:index.bzl", "ts_library")
load("//common:label.bzl", "absolute")
load("//packages/renderer:build_vars.bzl", "RENDERER_RUNTIME_DEPS")

def prerender_page(
    name,
    src,
    lib_deps = [],
    scripts = [],
    deps = [],
    testonly = None,
    visibility = None,
):
    """Renders an HTML page with the given TypeScript source at build time.

    This invokes the default export function of the given `src` TypeScript,
    expecting a `string` (or `Promise<string>`) returned and generates an HTML
    file with that content.

    `src` must compile to a CommonJS module with a default export that is a
    function which accepts no arguments and returns a `string` or a
    `Promise<string>`. A `ts_library()` is used to generate this and `lib_deps`
    is used as the `deps` parameter.

    Outputs:
        %{name}.html: An HTML file containing the content returned by the `src`
            file.
    
    Args:
        name: The name of this rule.
        src: The TypeScript source file.
        lib_deps: Dependencies for the TypeScript source file.
        scripts: List of client-side JavaScript libraries to be bundled for the
            generated page.
        deps: `prerender_component()` dependencies for this component.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        visibility: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    """

    # Compile the user provided TypeScript source.
    prerender_lib = "%s_prerender" % name
    ts_library(
        name = prerender_lib,
        srcs = [src],
        testonly = testonly,
        deps = lib_deps + ["%s_prerender" % absolute(dep) for dep in deps],
    )

    # Get the generated JS file path for the user provided TypeScript source.
    prerender_js = "%s_prerender_js" % name
    native.filegroup(
        name = prerender_js,
        srcs = [":%s" % prerender_lib],
        testonly = testonly,
        output_group = "es5_sources",
    )

    # Create a binary to execute the runner script.
    binary = "%s_binary" % name
    nodejs_binary(
        name = binary,
        entry_point = "//packages/renderer:renderer_js",
        testonly = testonly,
        data = RENDERER_RUNTIME_DEPS + [
            ":%s" % prerender_lib,
            "//packages/renderer",
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
    _extract_annotations(
        name = name,
        annotated_page = annotated_page,
        testonly = testonly,
    )

    # Export only the extracted HTML file to users at `%{name}`.
    native.filegroup(
        name = name,
        srcs = ["%s.html" % name],
        visibility = visibility,
    )

    # Reexport all included scripts at `%{name}_scripts`.
    ts_library(
        name = "%s_scripts" % name,
        srcs = [],
        deps = scripts + ["%s_scripts" % absolute(dep) for dep in deps],
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
    testonly = None,
):
    """Extracts annotations from the provided HTML.
    
    Args:
        name: The name to base the output file paths on.
        annotated_page: An annotated HTML page to extract from.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    
    Outputs:
        %{name}.html: The input HTML page with all annotations removed.
        %{name}_metadata.json: Metadata generated from all the annotations in
            the page.
    """
    extracted_page = "%s.html" % name
    metadata = "%s_metadata.json" % name
    native.genrule(
        name = "%s_annotation_extractor" % name,
        srcs = [annotated_page],
        outs = [
            extracted_page,
            metadata,
        ],
        cmd = """
            $(location //packages/annotation_extractor) \\
                --input-html $(location {annotated_page}) \\
                --output-html $(location {extracted_page}) \\
                --output-metadata $(location {metadata})
        """.format(
            annotated_page = annotated_page,
            extracted_page = extracted_page,
            metadata = metadata,
        ),
        testonly = testonly,
        tools = ["//packages/annotation_extractor"],
    )
