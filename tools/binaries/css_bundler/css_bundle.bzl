load("@aspect_bazel_lib//lib:paths.bzl", "to_output_relative_path")
load("//packages/rules_prerender/css:css_providers.bzl", "CssImportMapInfo", "CssInfo")

def _css_bundle_impl(ctx):
    # Map each direct dependency source file to an output of the same full file path
    # under this target's name. Ideally we would just keep the name the same, but then
    # it would conflict with the source file (since that needs to be copied to bin to
    # be usable anyways). So instead we "namespace" each file under the target name
    # and include the full execroot-relative path to file to be truly unambiguous.
    # The output file structure will look like:
    # path/to/pkg/css_bundle_target/file_wksp_name/path/to/file.css
    sources = ctx.attr.dep[CssInfo].direct_sources
    outputs = [ctx.actions.declare_file("%s/%s" % (
        ctx.label.name,
        _workspace_short_path(src, ctx.label.workspace_name or ctx.workspace_name),
    )) for src in sources]

    # Map each entry point to its associated output.
    args = ctx.actions.args()
    for (source, output) in zip(sources, outputs):
        args.add("--entry-point", "./%s" % to_output_relative_path(source))
        args.add("--output", to_output_relative_path(output))

    ctx.actions.run(
        mnemonic = "BundleCss",
        progress_message = "Bundling styles %{label}",
        executable = ctx.executable._bundler,
        arguments = [args],
        inputs = ctx.attr.dep[CssInfo].transitive_sources,
        outputs = outputs,
        env = {
            "BAZEL_BINDIR": ctx.bin_dir.path,
        },
    )

    return [
        DefaultInfo(files = depset(outputs)),
        CssImportMapInfo(import_map = _make_import_map(ctx, sources, outputs)),
    ]

css_bundle = rule(
    implementation = _css_bundle_impl,
    attrs = {
        "dep": attr.label(
            mandatory = True,
            providers = [CssInfo],
            doc = "The `css_library()` target to bundle all its direct sources.",
        ),
        "_bundler": attr.label(
            default = "//tools/binaries/css_bundler",
            executable = True,
            cfg = "exec",
        ),
    },
    doc = """
        Bundles the direct sources of the given dependency by treating each file as its
        own entry point and resolving `@import` statements to inline the dependencies.
    """,
)

def _workspace_short_path(file, current_wksp):
    if file.short_path.startswith("../"):
        # File is in an external workspace with path: `../external_wksp/path/to/file`.
        # Just drop the `../` and we have the right path.
        return file.short_path[len("../"):]
    else:
        # File is in the main workspace. Use the current workspace name.
        return "%s/%s" % (current_wksp, file.short_path)

def _make_import_map(ctx, sources, outputs):
    """Generates a map of import paths to the actual file location to import.
    
    When users call `inlineStyle()`, it resolves and looks up that path in this map
    and actually inlines the file specified by the map. This allows the file path in
    user code to differ from the actual path the bundled CSS file lives at.
    """
    import_map = dict()
    for (source, output) in zip(sources, outputs):
        wksp_path = _workspace_short_path(source, ctx.workspace_name)

        if wksp_path in import_map:
            fail("CSS library file (%s) mapped twice, once to %s and a second time to %s." % (
                wksp_path,
                import_map[wksp_path].path,
                output.path,
            ))

        import_map[wksp_path] = output

    return import_map
