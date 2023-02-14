"""Defines functionality to generate entry points for JS and CSS."""

def _script_entry_point_impl(ctx):
    package_depth = len(ctx.label.package.split("/")) if ctx.label.package != "" else 0
    ctx.actions.run(
        mnemonic = "GenerateScriptEntryPoint",
        progress_message = "Generating script entry point %{label}",
        executable = ctx.executable._generator,
        arguments = [
            "--metadata", ctx.file.metadata.short_path,
            "--import-depth", str(package_depth),
            "--output", ctx.outputs.output_entry_point.short_path,
        ],
        inputs = [ctx.file.metadata],
        outputs = [ctx.outputs.output_entry_point],
        env = {
            "BAZEL_BINDIR": ctx.bin_dir.path,
        },
    )

script_entry_point = rule(
    implementation = _script_entry_point_impl,
    attrs = {
        "metadata": attr.label(
            mandatory = True,
            allow_single_file = True,
        ),
        "output_entry_point": attr.output(mandatory = True),
        "_generator": attr.label(
            default = "//tools/internal:script_entry_generator",
            executable = True,
            cfg = "exec", # TODO(#48): Switch to `js_run_binary()`.
        ),
    },
)
