"""Defines functionality to generate entry points for JS and CSS."""

load("@aspect_bazel_lib//lib:paths.bzl", "to_output_relative_path")
load("@aspect_rules_js//js:defs.bzl", "js_run_binary")
load("//common:label.bzl", "absolute", "file_path_of")

visibility(["//"])

def _script_entry_points_impl(ctx):
    output = ctx.actions.declare_directory(ctx.label.name)

    args = ctx.actions.args()
    args.add("--metadata", to_output_relative_path(ctx.file.metadata))
    package_depth = len(ctx.label.package.split("/")) if ctx.label.package != "" else 0
    # Add one to import depth because files will be generated in the output directory
    # which is one level deeper than the package.
    args.add("--import-depth", str(package_depth + 1))
    args.add("--output-dir", to_output_relative_path(output))

    ctx.actions.run(
        mnemonic = "GenerateScriptEntryPoints",
        progress_message = "Generating script entry points %{label}",
        executable = ctx.executable._script_entry_generator,
        arguments = [args],
        inputs = [ctx.file.metadata],
        outputs = [output],
        env = {"BAZEL_BINDIR": ctx.bin_dir.path},
    )

    return DefaultInfo(files = depset([output]))

script_entry_points = rule(
    implementation = _script_entry_points_impl,
    attrs = {
        "metadata": attr.label(
            mandatory = True,
            allow_single_file = True,
        ),
        "_script_entry_generator": attr.label(
            default = "//tools/binaries/script_entry_generator",
            executable = True,
            cfg = "exec",
        ),
    },
)

def script_entry_point(
    name,
    metadata,
    output_entry_point,
    testonly = None,
    visibility = None,
):
    """Generates an entry point for scripts with the given metadata.

    Args:
        name: Name of this target.
        metadata: A metadata JSON file containing information about the scripts
            to bundle.
        output_entry_point: Location to write the generated script entry point.
        testonly: https://bazel.build/reference/be/common-definitions#common-attributes
        visibility: https://bazel.build/reference/be/common-definitions#common-attributes
    """
    package_depth = len(native.package_name().split("/")) if native.package_name() != "" else 0
    js_run_binary(
        name = name,
        mnemonic = "GenerateScriptEntryPoint",
        progress_message = "Generating script entry point %{label}",
        srcs = [metadata],
        outs = [output_entry_point],
        tool = Label("//tools/binaries/script_entry_generator"),
        args = [
            "--metadata", file_path_of(absolute(metadata)),
            "--import-depth", str(package_depth),
            "--output", file_path_of(absolute(output_entry_point)),
        ],
        testonly = testonly,
        visibility = visibility,
    )
