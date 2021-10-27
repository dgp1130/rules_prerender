"""Defines `multi_inject_resources()` functionality."""

load(":web_resources.bzl", "WebResourceInfo")

def _multi_inject_resources_impl(ctx):
    # Generate configuration JSON from inputs.
    script_injections = [{"type": "script", "path": script}
                         for script in ctx.attr.scripts]
    style_injections = [{"type": "style", "path": style.path}
                         for style in ctx.files.styles]
    injections = script_injections + style_injections

    # Write the configuration to a file.
    config = ctx.actions.declare_file("%s_config.json" % ctx.attr.name)
    ctx.actions.write(config, json.encode_indent(injections, indent = "  "))

    output_dir = ctx.actions.declare_directory(ctx.attr.name)

    # Run the resource injector.
    args = ctx.actions.args()
    args.add("--input-dir", ctx.file.input_dir.path)
    args.add("--config", config.path)
    if ctx.attr.bundle:
        args.add("--bundle", ctx.file.bundle.path)
    args.add("--output-dir", output_dir.path)
    ctx.actions.run(
        mnemonic = "MultiInjectResources",
        progress_message = "Injecting resources into multiple pages",
        executable = ctx.executable._injector,
        arguments = [args],
        inputs = [ctx.file.input_dir, config] +
                 ([ctx.file.bundle] if ctx.file.bundle else []) +
                 ctx.files.styles,
        outputs = [output_dir],
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
        "bundle": attr.label(allow_single_file = True),
        "scripts": attr.string_list(),
        "styles": attr.label_list(allow_files = True),
        "_injector": attr.label(
            default = "//tools/internal:resource_injector",
            executable = True,
            cfg = "exec",
        ),
    },
)
