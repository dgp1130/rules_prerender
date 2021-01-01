"""Defines `prerender_page()` functionality."""

load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")
load("@npm//@bazel/typescript:index.bzl", "ts_library")
load("//packages/renderer:build_vars.bzl", "RENDERER_RUNTIME_DEPS")
load(":prerender_component.bzl", "prerender_component")

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
        %{name}_scripts: A `ts_library()` rule containing all the client-side
            scripts used by the page. This includes a generate file
            `%{name}_scripts.ts` which acts as an entry point, importing all
            scripts that were included in the page via `includeScript()`.
    
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
    # Generates `%{name}_component_prerender` and `%{name}_component_scripts`.
    prerender_component(
        name = "%s_component" % name,
        srcs = [src],
        lib_deps = lib_deps,
        scripts = scripts,
        deps = deps,
        testonly = testonly,
    )
    prerender_lib = "%s_component_prerender" % name

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
    entry_point = "%s.ts" % client_scripts
    _entry_point(
        name = "%s_entry" % name,
        metadata = metadata,
        output_entry_point = entry_point,
        testonly = testonly,
    )

    # Reexport all included scripts at `%{name}_scripts`.
    ts_library(
        name = client_scripts,
        srcs = [entry_point],
        deps = ["%s_component_scripts" % name],
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
            $(location //packages/annotation_extractor) \\
                --input-html $(location {annotated_page}) \\
                --output-html $(location {output_html}) \\
                --output-metadata $(location {output_metadata})
        """.format(
            annotated_page = annotated_page,
            output_html = output_page,
            output_metadata = output_metadata,
        ),
        testonly = testonly,
        tools = ["//packages/annotation_extractor"],
    )

def _entry_point(name, metadata, output_entry_point, testonly = None):
    """Creates a TypeScript entry point for the given metadata JSON.
    
    Args:
        name: The name of the rule.
        metadata: The metadata JSON file to generate an entry point from.
        output_entry_point: The file to write the entry point contents to.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    """
    native.genrule(
        name = name,
        srcs = [metadata],
        outs = [output_entry_point],
        cmd = """
            $(location //packages/entry_generator) \\
                --metadata $(location {metadata}) \\
                --output $(location {output})
        """.format(
            metadata = metadata,
            output = output_entry_point,
        ),
        tools = ["//packages/entry_generator"],
    )
