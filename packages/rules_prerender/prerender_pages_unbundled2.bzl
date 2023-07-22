"""Defines `prerender_pages_unbundled()` functionality."""

load("@aspect_rules_js//js:defs.bzl", "js_library")
load("@aspect_rules_js//js:providers.bzl", "JsInfo", "js_info")
load("//common:label.bzl", "absolute", "file_path_of", "rel_path")
load("//common:paths.bzl", "js_output", "is_js_file")
load("//packages/rules_prerender/css:css_group.bzl", "merge_import_maps")
load("//packages/rules_prerender/css:css_providers.bzl", "CssImportMapInfo", "CssInfo")
load(":prerender_component2.bzl", "prerender_component")
load(":prerender_metadata.bzl", "PrerenderMetadataInfo")
load(":prerender_resources.bzl", "prerender_resources_internal")
load(":script_entry_points.bzl", "script_entry_points")
load(":web_resources.bzl", "WebResourceInfo", "web_resources")

visibility("public")

def prerender_pages_unbundled(
    name,
    entry_point,
    prerender,
    scripts = None,
    styles = None,
    resources = None,
    testonly = None,
    visibility = None,
    debug_target = None,
):
    """Renders a directory of resources at build time.

    This invokes the default export function of the given `entry_point` and
    generates a directory of files with the result.

    The file listed in `src` must compile to an ESM module with a default
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

    Outputs:
        %{name}: A `web_resources()` target containing all the generated files.
        %{name}_scripts: A `js_library()` target containing all the client-side
            scripts used by the page.
        %{name}_scripts_entries: A `TreeArtifact` containing all the entry
            points used for bundling laid out in the generated directory format.
        %{name}_styles: A `css_library()` target re-exporting all the styles
            used in any page.
        %{name}_resources: A `web_resources()` target containing all the
            transitively used resources.
    
    Args:
        name: The name of this rule.
        entry_point: The JavaScript file to invoke as the entry point of the
            binary.
        prerender: Passed through to `prerender_component()`.
        scripts: Passed through to `prerender_component()`.
        styles: Passed through to `prerender_component()`.
        resources: Passed through to `prerender_component()`.
        testonly: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        visibility: See https://docs.bazel.build/versions/master/be/common-definitions.html.
        debug_target: The label to check
            `@rules_prerender//tools/flags:debug_prerender` for. If the flag is
            set to this label, then the renderer binary with open a debugger for
            local debugging. Defaults to this target's label. Useful for
            providing intuitive flag behavior in macros.
    """
    # Generate a component of the user's code.
    component = "%s_component" % name
    prerender_component(
        name = component,
        prerender = prerender,
        scripts = scripts,
        styles = styles,
        resources = resources,
        testonly = testonly,
    )
    component_metadata = "%s_metadata" % component
    component_prerender = "%s_prerender" % component

    # Re-export transitive styles.
    transitive_styles = "%s_styles" % name
    _collect_transitive_styles(
        name = transitive_styles,
        metadata = component_metadata,
        testonly = testonly,
        visibility = visibility,
    )

    # Execute the runner to generate annotated resources.
    annotated = "%s_annotated" % name
    prerender_resources_internal(
        name = annotated,
        entry_point = entry_point,
        styles = ":%s" % transitive_styles,
        debug_target = debug_target or "//%s:%s" % (native.package_name(), name),
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

    # Generate the entry points importing all included scripts for each page.
    transitive_scripts = "%s_scripts" % name
    script_entry_points(
        name = "%s_entries" % transitive_scripts,
        metadata = metadata,
        testonly = testonly,
        # TODO: Remove?
        # Export this file so Rollup can have a direct, label reference to the
        # entry point, since including the file in a `depset()` with other files
        # is not good enough.
        visibility = visibility,
    )

    # Reexport all included scripts at `%{name}_scripts`.
    _collect_transitive_scripts(
        name = transitive_scripts,
        metadata = component_metadata,
        testonly = testonly,
        visibility = visibility,
    )

    # Reexport all transitive resources at `%{name}_resources`.
    output_resources = "%s_resources" % name
    _collect_transitive_resources(
        name = output_resources,
        metadata = component_metadata,
        testonly = testonly,
        visibility = visibility,
    )

_CollectedPrerenderMetadataInfo = provider(fields = {
    "transitive_metadata": "TODO",
})

_ASPECT_LABEL_ATTRS = ["prerender", "scripts", "styles", "resources", "actual", "metadata"]
_ASPECT_LABEL_LIST_ATTRS = ["deps"]
_ASPECT_ATTRS = _ASPECT_LABEL_ATTRS + _ASPECT_LABEL_LIST_ATTRS

def _collect_transitive_metadata_aspect_impl(target, ctx):
    metadata = [target[PrerenderMetadataInfo]] if PrerenderMetadataInfo in target else []

    maybe_deps = [getattr(ctx.rule.attr, attr, None)
                  for attr in _ASPECT_LABEL_ATTRS] + getattr(ctx.rule.attr, "deps", [])
    deps = [dep for dep in maybe_deps if dep]
    transitive_metadata = [dep[_CollectedPrerenderMetadataInfo].transitive_metadata
                           for dep in deps
                           if _CollectedPrerenderMetadataInfo in dep]

    return _CollectedPrerenderMetadataInfo(
        transitive_metadata = depset(
            direct = metadata,
            transitive = transitive_metadata,
        ),
    )

_collect_transitive_metadata_aspect = aspect(
    implementation = _collect_transitive_metadata_aspect_impl,
    attr_aspects = _ASPECT_ATTRS,
)

def _collect_transitive_styles_impl(ctx):
    transitive_metadata = ctx.attr.metadata[_CollectedPrerenderMetadataInfo].transitive_metadata.to_list()
    transitive_styles = [metadata.styles.transitive_sources
                         for metadata in transitive_metadata
                         if metadata.styles]
    transitive_import_maps = [metadata.styles_import_map
                              for metadata in transitive_metadata
                              if metadata.styles_import_map]

    return [
        DefaultInfo(files = depset(
            direct = [],
            transitive = transitive_styles,
        )),
        CssInfo(
            direct_sources = [],
            transitive_sources = depset(
                direct = [],
                transitive = transitive_styles,
            ),
        ),
        CssImportMapInfo(
            import_map = merge_import_maps(transitive_import_maps),
        ),
    ]

_collect_transitive_styles = rule(
    implementation = _collect_transitive_styles_impl,
    attrs = {
        "metadata": attr.label(
            mandatory = True,
            providers = [PrerenderMetadataInfo],
            aspects = [_collect_transitive_metadata_aspect],
        ),
    },
)

def _collect_transitive_scripts_impl(ctx):
    transitive_metadata = ctx.attr.metadata[_CollectedPrerenderMetadataInfo].transitive_metadata.to_list()
    transitive_scripts = [metadata.scripts
                         for metadata in transitive_metadata
                         if metadata.scripts]

    merged_js_info = js_info(
        declarations = depset([],
            transitive = [info.declarations
                          for info in transitive_scripts],
        ),
        npm_linked_package_files = depset([],
            transitive = [info.npm_linked_package_files
                          for info in transitive_scripts],
        ),
        npm_linked_packages = depset([],
            transitive = [info.npm_linked_packages
                          for info in transitive_scripts],
        ),
        npm_package_store_deps = depset([],
            transitive = [info.npm_package_store_deps
                          for info in transitive_scripts],
        ),
        sources = depset([],
            transitive = [info.sources
                          for info in transitive_scripts],
        ),
        transitive_declarations = depset([],
            transitive = [info.transitive_declarations
                          for info in transitive_scripts],
        ),
        transitive_npm_linked_package_files = depset([],
            transitive = [info.transitive_npm_linked_package_files
                          for info in transitive_scripts],
        ),
        transitive_npm_linked_packages = depset([],
            transitive = [info.transitive_npm_linked_packages
                          for info in transitive_scripts],
        ),
        transitive_sources = depset([],
            transitive = [info.transitive_sources
                          for info in transitive_scripts],
        ),
    )

    return merged_js_info

_collect_transitive_scripts = rule(
    implementation = _collect_transitive_scripts_impl,
    attrs = {
        "metadata": attr.label(
            mandatory = True,
            providers = [PrerenderMetadataInfo],
            aspects = [_collect_transitive_metadata_aspect],
        ),
    },
)

def _collect_transitive_resources_impl(ctx):
    transitive_metadata = ctx.attr.metadata[_CollectedPrerenderMetadataInfo].transitive_metadata.to_list()
    transitive_resources = [metadata.resources.transitive_entries
                         for metadata in transitive_metadata
                         if metadata.resources]

    return WebResourceInfo(
        transitive_entries = depset(
            direct = [],
            transitive = transitive_resources,
        ),
    )

_collect_transitive_resources = rule(
    implementation = _collect_transitive_resources_impl,
    attrs = {
        "metadata": attr.label(
            mandatory = True,
            providers = [PrerenderMetadataInfo],
            aspects = [_collect_transitive_metadata_aspect],
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
            default = "//tools/binaries/annotation_extractor",
            executable = True,
            cfg = "exec",
        ),
    },
    doc = """Extracts annotations from HTML files in the provided directory.""",
)
