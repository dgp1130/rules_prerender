"""Defines `multi_inject_resources()` functionality."""

load(":web_resources.bzl", "WebResourceInfo")

visibility(["//"])

def _multi_inject_resources_impl(ctx):
    # Generate configuration JSON from inputs.
    script_injections = [{"type": "script", "path": script}
                         for script in ctx.attr.scripts]
    injections = script_injections

    # Write the configuration to a file.
    config = ctx.actions.declare_file("%s_config.json" % ctx.attr.name)
    ctx.actions.write(config, json.encode_indent(injections, indent = "  "))

    output_dir = ctx.actions.declare_directory(ctx.attr.name)

    # Run the resource injector.
    args = ctx.actions.args()
    args.add("--input-dir", ctx.file.input_dir.short_path)
    args.add("--config", config.short_path)
    args.add("--bundles", ctx.file.bundles.short_path)
    args.add("--output-dir", output_dir.short_path)
    ctx.actions.run(
        mnemonic = "MultiInjectResources",
        progress_message = "Injecting resources into multiple pages",
        executable = ctx.executable._injector,
        arguments = [args],
        inputs = [ctx.file.input_dir, config] +
                 ([ctx.file.bundles] if ctx.file.bundles else []) +
                 ctx.files.styles,
        outputs = [output_dir],
        env = {
            "BAZEL_BINDIR": ctx.bin_dir.path,
        },
    )

    return [
        DefaultInfo(files = depset([output_dir])),
        WebResourceInfo(transitive_entries = depset([output_dir])),
    ]

multi_inject_resources = rule(
    implementation = _multi_inject_resources_impl,
    attrs = {
        "input_dir": attr.label(
            mandatory = True,
            allow_single_file = True,
        ),
        "bundles": attr.label(
            mandatory = True,
            allow_single_file = True,
        ),
        "scripts": attr.string_list(),
        "styles": attr.label(),
        "_injector": attr.label(
            default = "//tools/binaries/resource_injector",
            executable = True,
            cfg = "exec",
        ),
    },
)
