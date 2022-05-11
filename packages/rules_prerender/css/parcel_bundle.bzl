load(":css_providers.bzl", "CssImportMapInfo", "CssInfo")

def _parcel_bundle_impl(ctx):
    entry_points = ctx.attr.dep[CssInfo].direct_sources
    outputs = []
    for entry_point in entry_points:
        outputs.append(ctx.actions.declare_file(entry_point.basename))

    args = ctx.actions.args()
    for (input, output) in zip(entry_points, outputs):
        args.add("--entry-point", input)
        args.add("--output", output)

    for source in ctx.attr.dep[CssInfo].transitive_sources.to_list():
        import_path = "%s/%s" % (ctx.workspace_name, source.short_path)
        args.add("--import-path", import_path)
        args.add("--import-file", source)

    args.add("--workspace-name", ctx.workspace_name)

    ctx.actions.run(
        mnemonic = "BundleCss",
        progress_message = "Bundling CSS - %s" % ctx.label,
        executable = ctx.executable._bundler,
        arguments = [args],
        inputs = ctx.attr.dep[CssInfo].transitive_sources,
        outputs = outputs,
    )

    return [
        DefaultInfo(files = depset(outputs)),
        CssImportMapInfo(
            import_map = _make_import_map(zip(entry_points, outputs), ctx.workspace_name),
        ),
    ]


parcel_bundle = rule(
    implementation = _parcel_bundle_impl,
    attrs = {
        "dep": attr.label(
            mandatory = True,
            providers = [CssInfo],
        ),
        "_bundler": attr.label(
            default = "//packages/css_bundler",
            cfg = "exec",
            executable = True,
        ),
    },
)

def _make_import_map(zipped_inputs_and_outputs, wksp):
    map = {}
    for (input, output) in zipped_inputs_and_outputs:
        import_path = "%s/%s" % (wksp, input.short_path)
        map[import_path] = output
    return map