load(
    "@aspect_bazel_lib//lib:copy_to_bin.bzl",
    "copy_file_to_bin_action",
    "copy_files_to_bin_actions",
)
load("@aspect_bazel_lib//lib:paths.bzl", "to_output_relative_path")
load("@aspect_rules_js//js:providers.bzl", "JsInfo")

visibility("public")

def _bundle_impl(ctx):
    # Gather all the transitive `*.js` files and `node_modules/` dependencies.
    raw_sources = depset([], transitive = [dep[JsInfo].transitive_sources
                                           for dep in ctx.attr.deps])
    node_modules = depset([],
        transitive = [package.transitive_files
                      for dep in ctx.attr.deps
                      for package in dep[JsInfo].npm_linked_packages.to_list()],
    )

    # Copy everything to bin so they are accessible by the `js_binary()` tool.
    sources = copy_files_to_bin_actions(ctx, raw_sources.to_list())
    manifest = copy_file_to_bin_action(ctx, ctx.file.entry_points)
    config = copy_file_to_bin_action(ctx, ctx.file.config)

    output = ctx.actions.declare_directory(ctx.label.name)

    args = ctx.actions.args()
    args.add(to_output_relative_path(manifest)) # Manifest must be the first argument.
    # Remaining arguments are passed through to Rollup.
    args.add("--config", to_output_relative_path(config))
    args.add("--output.dir", to_output_relative_path(output))
    args.add("--format", "esm")
    args.add("--silent")

    # Bundle the specified entry points to the output directory.
    ctx.actions.run(
        mnemonic = "RollupBundle",
        progress_message = "Bundling JavaScript %{label}",
        executable = ctx.executable._bundler,
        arguments = [args],
        inputs = sources + node_modules.to_list() + [manifest, config],
        outputs = [output],
        env = {"BAZEL_BINDIR": ctx.bin_dir.path},
    )

    return DefaultInfo(files = depset([output]))

bundle = rule(
    implementation = _bundle_impl,
    attrs = {
        "entry_points": attr.label(
            mandatory = True,
            allow_single_file = [".manifest"],
        ),
        "config": attr.label(
            mandatory = True,
            allow_single_file = [".js"],
        ),
        "deps": attr.label_list(
            mandatory = True,
            providers = [JsInfo],
        ),
        "_bundler": attr.label(
            default = "//tools/binaries/script_bundler",
            executable = True,
            cfg = "exec",
        )
    },
)
