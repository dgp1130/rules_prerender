"""Defines `prerender_multi_page()` functionality."""

load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")
load("@npm//@bazel/typescript:index.bzl", "ts_library")
load("//packages/renderer:build_vars.bzl", "MULTI_RENDERER_RUNTIME_DEPS")
load(":entry_points.bzl", "script_entry_point", "style_entry_point")
load(":prerender_component.bzl", "prerender_component")
load(":web_resources.bzl", "WebResourceInfo", "web_resources")

def prerender_multi_page(
    name,
    src,
    tsconfig = None,
    lib_deps = [],
    scripts = [],
    styles = [],
    resources = [],
    deps = [],
    testonly = None,
    visibility = None,
):
    """Renders a directory of resources with the given TypeScript source at build time.

    This invokes the default export function of the given `src` TypeScript,
    and generates a directory of files with the returned content at their
    corresponding locations.

    The file listed in `src` must compile to a CommonJS module with a default
    export of the type:
    
    ```
    () => Iterable<PrerenderResource> | Promise<Iterable<PrerenderResource>>
        | AsyncIterable<PrerenderResource>
    ```
    
    A `ts_library()` is used to compile the `src` file and `lib_deps` + `deps`
    is used as the `deps` parameter with the given `tsconfig`.

    Outputs:
        %{name}: A `web_resources()` target containing all the files generated
            by the `src` file at their corresponding locations.
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
        src: The TypeScript source file with a default export which generates
            any number of resources.
        tsconfig: A label referencing a tsconfig.json file or `ts_config()`
            target. Will be used to compile the `src` file.
        lib_deps: Dependencies for the TypeScript source file.
        scripts: List of client-side JavaScript libraries to be included with
            the generated pages.
        styles: List of CSS files or `filegroup()`s to included with the
            prerendered HTML files.
        resources: List of `web_resources()` rules required by the pages at
            runtime.
        deps: `prerender_component()` dependencies for the generated pages.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        visibility: See https://docs.bazel.build/versions/master/be/common-definitions.html.
    """
    # Generate a component of the user's code.
    component = "%s_component" % name
    prerender_component(
        name = component,
        srcs = [src],
        tsconfig = tsconfig,
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
        entry_point = "//packages/renderer:multi_renderer_js",
        templated_args = ["--bazel_patch_module_resolver"],
        testonly = testonly,
        data = MULTI_RENDERER_RUNTIME_DEPS + [
            ":%s" % component_prerender,
            "//tools/internal:multi_renderer",
        ],
    )

    # Execute the runner to generate annotated resources.
    annotated = "%s_annotated" % name
    _prerender_multi_page_rule(
        name = annotated,
        entry_point = ":%s" % prerender_js,
        multi_renderer = ":%s" % binary,
        testonly = testonly,
    )

    # Extract annotations and generate metadata from them.
    metadata = "%s_metadata.json" % name
    _multi_extract_annotations(
        name = name,
        annotated_dir = ":%s" % annotated,
        output_metadata = ":%s" % metadata,
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
    client_scripts = "%s_scripts" % name
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
    client_styles = "%s_styles" % name
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

def _prerender_multi_page_impl(ctx):
    # Invoke the renderer and output the content.
    output_dir = ctx.actions.declare_directory(ctx.attr.name)
    ctx.actions.run(
        mnemonic = "MultiPrerender",
        progress_message = "Prerendering multiple pages",
        executable = ctx.executable.multi_renderer,
        arguments = [
            "--entry-point", "%s/%s" % (
                ctx.workspace_name,
                ctx.file.entry_point.short_path,
            ),
            "--output-dir", output_dir.path,
        ],
        inputs = [ctx.file.entry_point],
        outputs = [output_dir],
    )

    return [
        DefaultInfo(files = depset([output_dir])),
        WebResourceInfo(transitive_entries = depset([output_dir])),
    ]

_prerender_multi_page_rule = rule(
    implementation = _prerender_multi_page_impl,
    attrs = {
        "entry_point": attr.label(
            mandatory = True,
            allow_single_file = True,
        ),
        "multi_renderer": attr.label(
            mandatory = True,
            executable = True,
            cfg = "exec",
        ),
    },
)

def _multi_extract_annotations_impl(ctx):
    """Invokes the multi annotation extractor and returns the new directory.
    
    Returns a `DefaultInfo()` object containing a directory which holds all the
    input files at their same relative location. Non-HTML files are copied over
    unchanged, while HTML files have their annotations removed and extracted
    into a separate metadata file.
    """
    output_dir = ctx.actions.declare_directory(ctx.attr.name)

    args = ctx.actions.args()
    args.add("--input-dir", ctx.file.annotated_dir.path)
    args.add("--output-dir", output_dir.path)
    args.add("--output-metadata", ctx.outputs.output_metadata.path)

    ctx.actions.run(
        mnemonic = "MultiAnnotationExtractor",
        progress_message = "Extracting annotations from multiple pages",
        executable = ctx.executable._extractor,
        arguments = [args],
        inputs = [ctx.file.annotated_dir],
        outputs = [
            output_dir,
            ctx.outputs.output_metadata,
        ],
    )

    return [
        DefaultInfo(files = depset([output_dir])),
        WebResourceInfo(transitive_entries = depset([output_dir])),
    ]

_multi_extract_annotations = rule(
    implementation = _multi_extract_annotations_impl,
    attrs = {
        "annotated_dir": attr.label(
            mandatory = True,
            allow_single_file = True,
            doc = """
                A directory of annotated HTML pages to extract from. May also
                contain non-HTML content which will be copied through to the
                output.
            """
        ),
        "output_metadata": attr.output(
            mandatory = True,
            doc = """
                The file to write the output metadata JSON which is generated
                from the annotations extracted from input HTML files.
            """,
        ),
        "_extractor": attr.label(
            default = "//tools/internal:multi_annotation_extractor",
            executable = True,
            cfg = "exec",
        ),
    },
    doc = """Extracts annotations from HTML files in the provided directory.""",
)
