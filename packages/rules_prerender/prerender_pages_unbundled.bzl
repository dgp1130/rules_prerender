"""Defines `prerender_pages_unbundled()` functionality."""

load("@aspect_rules_js//js:defs.bzl", "js_library")
load("//common:label.bzl", "absolute", "file_path_of", "rel_path")
load(":prerender_component.bzl", "prerender_component")
load(":prerender_resources.bzl", "prerender_resources_internal")
load(":script_entry_point.bzl", "script_entry_point")
load(":web_resources.bzl", "WebResourceInfo", "web_resources")

def prerender_pages_unbundled(
    name,
    src,
    tsconfig = None,
    data = [],
    source_map = None,
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
    
    A `ts_project()` is used to compile the `src` file and `lib_deps` + `deps`
    is used as the `deps` parameter with the given `tsconfig`.

    Outputs:
        %{name}: A `web_resources()` target containing all the files generated
            by the `src` file at their corresponding locations.
        %{name}_scripts: A `js_library()` rule containing all the client-side
            scripts used by the page. This includes a generated file
            `%{name}_scripts.js` which acts as an entry point, importing all
            scripts that were included in the page via `includeScript()`.
        %{name}_resources: A `web_resources()` target containing all the
            transitively used resources.
        %{name}_prerender_for_test: An alias to the `ts_project()` target which
            compiles the `src` of this macro marked as `testonly`. This provides
            a simple hook for unit testing prerender logic.
    
    Args:
        name: The name of this rule.
        src: The TypeScript source file with a default export which generates
            any number of resources.
        tsconfig: A label referencing a tsconfig.json file or `ts_config()`
            target. Will be used to compile the `src` file.
        source_map: A boolean indicating whether or not to generate source maps for
            prerendered TypeScript.
        data: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        lib_deps: Dependencies for the TypeScript source file.
        scripts: List of client-side JavaScript libraries to be included with
            the generated pages.
        styles: List of `css_library()` targets which can be inlined in prerendered
            HTML.
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
        source_map = source_map,
        data = data,
        lib_deps = lib_deps,
        scripts = scripts,
        styles = styles,
        resources = resources,
        deps = deps,
        testonly = testonly,
    )
    component_prerender = "%s_prerender" % component
    component_prerender_for_test = "%s_prerender_for_test" % component
    component_scripts = "%s_scripts" % component
    component_styles = "%s_styles" % component
    component_resources = "%s_resources" % component

    native.alias(
        name = "%s_prerender_for_test" % name,
        actual = ":%s" % component_prerender_for_test,
        testonly = True,
    )

    # Execute the runner to generate annotated resources.
    annotated = "%s_annotated" % name
    js_src = (
        ".ts".join(src.split(".ts")[:-1]) + ".js"
        if src.endswith(".ts")
        else src
    )
    prerender_resources_internal(
        name = annotated,
        entry_point = rel_path(file_path_of(absolute(js_src))),
        styles = ":%s" % component_styles,
        data = [":%s" % component_prerender],
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
    script_entry = "%s.js" % client_scripts
    script_entry_point(
        name = "%s_entry" % client_scripts,
        metadata = metadata,
        output_entry_point = script_entry,
        testonly = testonly,
        # Export this file so Rollup can have a direct, label reference to the
        # entry point, since including the file in a `depset()` with other files
        # is not good enough.
        visibility = visibility,
    )

    # Reexport all included scripts at `%{name}_scripts`.
    js_library(
        name = client_scripts,
        srcs = [script_entry],
        deps = [":%s" % component_scripts],
        testonly = testonly,
        visibility = visibility,
    )

    # Reexport all inlined styles at `%{name}_styles`.
    client_styles = "%s_styles" % name
    native.alias(
        name = client_styles,
        actual = ":%s" % component_styles,
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

def _multi_extract_annotations_impl(ctx):
    """Invokes the multi annotation extractor and returns the new directory.
    
    Returns a `DefaultInfo()` object containing a directory which holds all the
    input files at their same relative location. Non-HTML files are copied over
    unchanged, while HTML files have their annotations removed and extracted
    into a separate metadata file.
    """
    output_dir = ctx.actions.declare_directory(ctx.attr.name)

    args = ctx.actions.args()
    args.add("--input-dir", ctx.file.annotated_dir.short_path)
    args.add("--output-dir", output_dir.short_path)
    args.add("--output-metadata", ctx.outputs.output_metadata.short_path)

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
        env = {
            "BAZEL_BINDIR": ctx.bin_dir.path,
        },
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
            default = "//tools/internal:annotation_extractor",
            executable = True,
            cfg = "host", # TODO(#48): Use `exec`.
        ),
    },
    doc = """Extracts annotations from HTML files in the provided directory.""",
)
