load(
    "@aspect_bazel_lib//lib:copy_to_bin.bzl",
    "copy_file_to_bin_action",
    "copy_files_to_bin_actions",
)
load("@aspect_bazel_lib//lib:paths.bzl", "to_output_relative_path")
load("@aspect_rules_js//js:providers.bzl", "JsInfo")

visibility("private")

def _rollup_bundle_impl(ctx):
    config = copy_file_to_bin_action(ctx, ctx.file.config)
    transitive_deps = depset([],
        transitive = [dep[JsInfo].transitive_sources for dep in ctx.attr.deps],
    )
    deps = copy_files_to_bin_actions(ctx, transitive_deps.to_list()) + [config]
    deps_tree = _build_rerooted_tree(ctx, deps)

    output = ctx.actions.declare_directory(ctx.label.name)

    args = ctx.actions.args()
    args.add("--config", "%s/%s" % (
        to_output_relative_path(deps_tree),
        to_output_relative_path(config),
    ))
    args.add("--output.dir", to_output_relative_path(output))
    args.add("--format", "esm")
    args.add("--silent")
    args.add_all(
        ctx.files.entry_points,
        map_each = lambda entry: "%s/%s" % (
            to_output_relative_path(deps_tree),
            entry.tree_relative_path,
        ),
        allow_closure = True,
    )

    # DEBUG: Works.
    temp = ctx.actions.declare_file("%s_temp.txt" % ctx.label.name)
    ctx.actions.run_shell(
        command = "echo $1 >&2; cp $1 $2",
        arguments = [
            "%s/%s" % (deps_tree.path, to_output_relative_path(config)),
            temp.path,
        ],
        inputs = [deps_tree],
        outputs = [temp],
    )

    # DEBUG: Doesn't find config file.
    ctx.actions.run(
        mnemonic = "RollupBundle",
        progress_message = "Bundling JavaScript %{label}",
        executable = ctx.executable._rollup,
        arguments = [args],
        inputs = [deps_tree] + ctx.files.entry_points,
        outputs = [output],
        env = {
            "BAZEL_BINDIR": ctx.bin_dir.path,
        },
    )

    return DefaultInfo(files = depset([output, temp]))

rollup_bundle = rule(
    implementation = _rollup_bundle_impl,
    attrs = {
        "entry_points": attr.label(
            mandatory = True,
            allow_single_file = True,
            doc = "TODO",
        ),
        "deps": attr.label_list(
            mandatory = True,
            doc = "TODO",
        ),
        "config": attr.label(
            mandatory = True,
            allow_single_file = True,
            doc = "TODO",
        ),
        "_rollup": attr.label(
            default = "//tools/rollup",
            executable = True,
            cfg = "exec",
        ),
    },
    doc = "TODO",
)

def _build_rerooted_tree(ctx, deps):
    deps_tree = ctx.actions.declare_directory("%s_deps" % ctx.label.name)

    args = ctx.actions.args()
    args.add(deps_tree.path)
    args.add(ctx.bin_dir.path)
    args.add_all(deps, map_each = to_output_relative_path, expand_directories = False)
    ctx.actions.run_shell(
        mnemonic = "PrepareBundleDeps",
        progress_message = "Preparing bundle deps %{label}",
        command = """
            readonly OUTPUT="${1}"
            shift
            readonly BIN_DIR="${1}"
            shift

            for INPUT in ${@}; do
                DEST="${OUTPUT}/${INPUT}"
                mkdir -p $(dirname "${DEST}")
                cp -r "${BIN_DIR}/${INPUT}" "${OUTPUT}/${INPUT}"
            done
        """,
        arguments = [args],
        inputs = deps,
        outputs = [deps_tree],
    )

    return deps_tree
