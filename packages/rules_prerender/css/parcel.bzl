load("@build_bazel_rules_nodejs//:index.bzl", "npm_package_bin")
load("@build_bazel_rules_nodejs//:providers.bzl", "run_node")
load(":css_providers.bzl", "CssInfo")

def _parcel_impl(ctx):
    # Compile each direct source as an entry point with its own output.
    sources = [source for source in ctx.attr.dep[CssInfo].direct_sources]
    outputs = []
    for source in sources:
        outputs.append(ctx.actions.declare_file(source.basename))

    # Define arguments.
    args = ctx.actions.args()
    args.add("--bazel_patch_module_resolver")
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
        inputs = ctx.attr.dep[CssInfo].transitive_sources,
        outputs = outputs,
    )

    return DefaultInfo(files = depset(outputs))

parcel = rule(
    implementation = _parcel_impl,
    attrs = {
        "dep": attr.label(
            mandatory = True,
            providers = [CssInfo],
            doc = "The `css_library()` to bundle all direct sources of.",
        ),
        "_binary": attr.label(
            default = "//packages/rules_prerender/css:parcel",
            executable = True,
            cfg = "exec",
        ),
    },
)
