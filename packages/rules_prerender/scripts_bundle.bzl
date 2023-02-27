load(
    "@aspect_bazel_lib//lib:copy_to_bin.bzl",
    "copy_file_to_bin_action",
    "copy_files_to_bin_actions",
)
load("@aspect_bazel_lib//lib:paths.bzl", "to_output_relative_path")
load("@aspect_rules_js//js:providers.bzl", "JsInfo")

visibility("public")

def _scripts_bundle_impl(ctx):
    # Extract the config file.
    config_sources = [src
                      for src in ctx.attr._config[JsInfo].sources.to_list()
                      if src.path.endswith(".js")]
    if len(config_sources) != 1:
        fail("Expected a single source file for `config`, but got:\n%s" % "\n".join(
            [src.path for src in config_sources],
        ))
    config = config_sources[0]

    # Gather all the transitive `*.js` files and `node_modules/` from `deps` and
    # `_config`.
    sources = depset([],
        transitive = [ctx.attr._config[JsInfo].transitive_sources] +
                     [dep[JsInfo].transitive_sources
                      for dep in ctx.attr.deps],
    )
    node_modules = depset([],
        transitive = [package.transitive_files
                      for dep in ctx.attr.deps
                      for package in (
                          dep[JsInfo].transitive_npm_linked_packages.to_list() +
                          ctx.attr._config[JsInfo].transitive_npm_linked_packages.to_list()
                      )],
    )

    output = ctx.actions.declare_directory(ctx.label.name)
    args = ctx.actions.args()

    # Map each entry point to an output at the same relative file path.
    entry_points_path = ctx.file.entry_points.path
    args.add_all(
        [ctx.file.entry_points],
        # Rollup inputs should be listed as `output_bundle_name=path/to/input.js`.
        map_each = lambda entry: "{output_bundle}={entry_point}".format(
            # Output location is the same relative path as the input location.
            # Rollup adds `.js` automatically, so we strip that here.
            output_bundle = entry.tree_relative_path[:-len(".js")],
            entry_point = to_output_relative_path(entry),
        ),
        before_each = "-i",
        allow_closure = True,
    )
    args.add("--config", to_output_relative_path(config))
    args.add("--output.dir", to_output_relative_path(output))
    args.add("--format", "esm")
    args.add("--silent")
    args.add("--failAfterWarnings")

    # Bundle the specified entry points to the output directory.
    ctx.actions.run(
        mnemonic = "RollupBundle",
        progress_message = "Bundling JavaScript %{label}",
        executable = ctx.executable._rollup,
        arguments = [args],
        inputs = sources.to_list() + node_modules.to_list() + [
            ctx.file.entry_points,
        ],
        outputs = [output],
        env = {"BAZEL_BINDIR": ctx.bin_dir.path},
    )

    return DefaultInfo(files = depset([output]))

scripts_bundle = rule(
    implementation = _scripts_bundle_impl,
    attrs = {
        "entry_points": attr.label(
            mandatory = True,
            allow_single_file = True,
            doc = """
                A `TreeArtifact` containing JavaScript files serving as entry
                points for the bundle. Every file is considered an entry point,
                but they are allowed to import files outside the tree, as long
                as those files are included in transitive dependencies.
            """,
        ),
        "deps": attr.label_list(
            mandatory = True,
            providers = [JsInfo],
            doc = "Dependencies used by the bundled entry points.",
        ),
        "_rollup": attr.label(
            default = "//packages/rules_prerender:rollup",
            executable = True,
            cfg = "exec",
        ),
        "_config": attr.label(
            default = "//packages/rules_prerender:rollup_config",
            providers = [JsInfo],
        ),
    },
    doc = """
        Bundles the given `TreeArtifact` of entry points and generates a new
        `TreeArtifact` with files in the same locations as the inputs, except
        that each file has all its dependencies bundled in.

        Shared chunks may be separated out into new files in the output
        `TreeArtifact`.
    """,
)