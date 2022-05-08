load("@build_bazel_rules_nodejs//:index.bzl", "npm_package_bin")
load("@build_bazel_rules_nodejs//:providers.bzl", "run_node")
load(":css_providers.bzl", "CssImportMapInfo", "CssInfo")

def _parcel_impl(ctx):
    # Compile each direct source as an entry point with its own output.
    sources = [source for source in ctx.attr.dep[CssInfo].direct_sources]
    outputs = []
    for source in sources:
        outputs.append(ctx.actions.declare_file(source.basename))

    wksp = ctx.attr.dep.label.workspace_name if ctx.attr.dep.label.workspace_name else ctx.workspace_name

    import_map = {}
    # TODO: Avoid `to_list()` with `args.add_all(map_each)`
    # TODO: Support external CSS?
    transitive_sources = [source for source in ctx.attr.dep[CssInfo].transitive_sources.to_list()]
    for source in transitive_sources:
        import_map["%s/%s" % (wksp, source.short_path)] = source.path
    import_map_file = ctx.actions.declare_file("%s_import_map.json" % ctx.attr.name)
    ctx.actions.write(import_map_file, json.encode_indent(import_map, indent = "    "))

    args = ctx.actions.args()
    args.add("--bazel_patch_module_resolver")

    # Define the config.
    args.add("--config", "./%s" % ctx.file._config.path)
    args.add("--import-map", import_map_file.path)

    # When debugging, set Parcel to print verbose logs.
    if ctx.var.get("VERBOSE_LOGS", False):
        args.add("--log-level", "verbose")

    # Define inputs and outputs.
    for (source, output) in zip(sources, outputs):
        args.add("--input", source)
        args.add("--output", output)

    # Bundle the CSS with Parcel.
    run_node(
        ctx,
        mnemonic = "ParcelCss",
        progress_message = "Bundling CSS with Parcel %s" % ctx.label,
        executable = "_binary",
        arguments = [args],
        inputs = depset([ctx.file._config, import_map_file], transitive = [
            ctx.attr.dep[CssInfo].transitive_sources,
        ]),
        outputs = outputs,
    )

    return [
        DefaultInfo(files = depset(outputs)),
        CssImportMapInfo(import_map = _make_import_map(zip(sources, outputs), wksp)),
    ]

parcel = rule(
    implementation = _parcel_impl,
    attrs = {
        "dep": attr.label(
            mandatory = True,
            providers = [CssInfo],
            doc = "The `css_library()` to bundle all direct sources of.",
        ),
        "_config": attr.label(
            default = "//packages/rules_prerender/css:parcel_config.json5",
            allow_single_file = True,
        ),
        "_binary": attr.label(
            default = "//packages/rules_prerender/css:parcel_bin",
            executable = True,
            cfg = "exec",
        ),
    },
)

def _make_import_map(zipped_inputs_and_outputs, wksp):
    import_map = dict()
    for (input, output) in zipped_inputs_and_outputs:
        # Verify that the importable path isn't already registered.
        key = "%s/%s" % (wksp, input.short_path)
        if key in import_map:
            fail("CSS library file (%s) mapped twice, once to %s and a second time to %s." % (
                key,
                import_map[key].path,
                output.path,
            ))

        import_map[key] = output

    return import_map
