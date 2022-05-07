load("@build_bazel_rules_nodejs//:index.bzl", "npm_package_bin")
load("@build_bazel_rules_nodejs//:providers.bzl", "run_node")
load(":css_providers.bzl", "CssInfo")

def _parcel_impl(ctx):
    # Compile each direct source as an entry point with its own output.
    sources = [source for source in ctx.attr.dep[CssInfo].direct_sources]
    if not sources:
        fail("`parcel()` requires at least one source file, but got none at %s" % ctx.attr.dep.label)

    outputs = []
    for source in sources:
        outputs.append(ctx.actions.declare_file(source.basename))

    # Define arguments.
    args = ctx.actions.args()
    args.add("--bazel_patch_module_resolver")
    args.add("build")
    args.add_all(sources)

    # All output and in the same directory with the same names as their inputs.
    args.add("--dist-dir", outputs[0].dirname)

    # Use custom config file.
    config = [file for file in ctx.files._config
              if file.basename == "parcel_config.json5"][0]
    args.add("--config", "./%s" % config.path)

    # TODO: Should print warnings?
    # Only print errors so the bundle is silent when successful.
    args.add("--log-level", "error")

    # Disable Parcel cache because we can rely on Bazel caching.
    args.add("--no-cache")

    # Bundle the CSS with Parcel.
    run_node(
        ctx,
        mnemonic = "BundleCss",
        progress_message = "Bundling CSS %s" % ctx.label,
        executable = "_parcel",
        arguments = [args],
        inputs = depset(ctx.files._config + ctx.files._package_json, transitive = [
            ctx.attr.dep[CssInfo].transitive_sources,
        ]),
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
        "_parcel": attr.label(
            default = "@npm//parcel/bin:parcel",
            executable = True,
            cfg = "exec",
        ),
        "_config": attr.label(
            # TODO: Make this work with external use cases.
            default = "//packages/rules_prerender/css:parcel_config",
        ),
        "_package_json": attr.label(
            # TODO: Make this work with external use cases.
            default = "//:parcel_package_json",
            allow_single_file = True,
        ),
    },
)
